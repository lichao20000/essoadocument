package cn.flying.rest.service.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;


/**
 * 
 * @author zhanglei 20130412
 * 
 */
public class DateUtil {
  public final static String DATE_PATTERN = "yyyy-MM-dd";

  public final static String TIME_PATTERN = "HH:mm:ss";

  public static final String DATE_TIME_PATTERN = DATE_PATTERN + " " + TIME_PATTERN;

  public static final String DATE_TIME_NUMBER_PATTERN = "yyyyMMddHHmmss";

  /**
   * 时间格式.
   */
  private static String timePattern = "HH:mm";
  /**
   * 中国的日期格式.
   */
  public static final String datePatternChina = "yyyy-MM-dd";
  /**
   * 中国的时间格式.
   */
  public static final String timePatternChina = "HH:mm:ss";
  /**
   * 中国的日期时间格式.
   */
  public static final String dateTimePatternChina = datePatternChina + " " + timePatternChina;

  // ~ Methods ================================================================


  /**
   * 获取未来最近指定时间的日期 timeInDay格式：00:00:00
   * 
   * @throws ParseException
   */
  public static Date getCustomDate(String timeInDay) throws ParseException {
    Date currentDate = new Date();
    SimpleDateFormat sdfNumber = new SimpleDateFormat(DATE_TIME_NUMBER_PATTERN);
    String currentDateStr = sdfNumber.format(currentDate);
    String currentTimeStr = currentDateStr.substring(8, currentDateStr.length());
    String newDateStr = currentDateStr.substring(0, 8) + timeInDay.replaceAll(":", "");
    Date newDate = sdfNumber.parse(newDateStr);

    if (Integer.parseInt(currentTimeStr) < Integer.parseInt(timeInDay.replaceAll(":", ""))) {
      return newDate;
    } else {
      Calendar c = Calendar.getInstance();
      c.setTime(newDate);
      c.add(Calendar.DATE, 1);
      return c.getTime();
    }
  }

  /**
   * 按给定格式获取给定日期
   */
  public static String getFormatedDate(Date date, String pattern) {
    SimpleDateFormat sdf = new SimpleDateFormat(pattern);
    // sdf.applyPattern(pattern);
    return sdf.format(date);
  }

  /**
   * 判断当前时间是否在开始时间和结束时间之间（格式00:00:00）
   * 
   * @param runtime
   * @param stoptime
   * @return
   */
  public static boolean checkBetween(String runtime, String stoptime) {
    SimpleDateFormat dfTime = new SimpleDateFormat(TIME_PATTERN);
    String checktime = dfTime.format(new Date());
    return checkBetween(checktime, runtime, stoptime);
  }

  /**
   * 判断给定时间是否在开始时间和结束时间之间（格式00:00:00）
   * 
   * @param checktime
   * @param runtime
   * @param stoptime
   * @return
   */
  public static boolean checkBetween(String checktime, String runtime, String stoptime) {
    long beginTime = Long.parseLong(runtime.replace(":", ""));
    long endTime = Long.parseLong(stoptime.replace(":", ""));
    long time = Long.parseLong(checktime.replace(":", ""));
    if (beginTime < endTime) {
      if (time >= beginTime && time < endTime) {
        return true;
      }
    } else if (beginTime > endTime) {
      long separator = 240000L;
      if ((time >= beginTime && time < separator) || time < endTime) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取日期时间
   * 
   * @author wanghongchen 20140505
   * @param aMask 格式
   * @param aDate 日期对象
   * @return 个格式化的字符串表示的日期
   * 
   */
  public static final String getDateTime(String aMask, Date aDate) {
    SimpleDateFormat df = null;
    String returnValue = "";

    if (aDate == null) {
      System.out.println("aDate is null!");
    } else {
      df = new SimpleDateFormat(aMask);
      returnValue = df.format(aDate);
    }

    return (returnValue);
  }

  /**
   * @author liuhezeng 20140513 将字符串转换为日期形式
   * 
   * @param aMask 格式
   * @param strDate 字符串日期 如：20140101
   * @return 日期对象
   * @see java.text.SimpleDateFormat
   * @throws ParseException
   */
  public static final String convertStringToDateForDBF(String aMask, String strDate)
      throws ParseException {


    Date date = new SimpleDateFormat("yyyyMMdd").parse(strDate);

    return new SimpleDateFormat("{^yyyy-MM-dd}").format(date);

  }

  public static void main(String[] args) throws ParseException {
    SimpleDateFormat sdf = new SimpleDateFormat();
    // Calendar cal = Calendar.getInstance();
    // cal.setTime(new Date());
    // cal.add(Calendar.DATE,1);
    // Date dd = cal.getTime();
    // String dateStr = new SimpleDateFormat("yyyyMMdd ").format(cal.getTime());
    // System.out.println(dateStr);

    // String currentDateStr = getFormatedDate(DATE_TIME_PATTERN);
    // System.out.println(currentDateStr.substring(11, currentDateStr.length()));

    Date testDate = getCustomDate("03:00:00");
    sdf.applyPattern(DATE_TIME_PATTERN);
    System.out.println(sdf.format(testDate));

    boolean betw = DateUtil.checkBetween("16:45:59", "22:50:00", "08:00:00");
    System.out.println(betw);
  }


  /**
   * 获取系统时间.
   * 
   * @author haoxin 20080415
   * @return String 返回中国日期时间格式的当前时间.
   */
  public static String getDateTime() {
    Date dt = new Date();
    DateFormat df = new SimpleDateFormat(dateTimePatternChina);// 设置显示格式
    String nowTime = df.format(dt);// 用DateFormat的format()方法在dt中获取系统时间
    return nowTime;
  }

  /**
   * 返回缺省的日期格式(yyyy-MM-dd).
   * 
   * @return String 一个字符串代表的日期模式UI.
   */
  public static synchronized String getDatePattern() {
    // Locale locale = LocaleContextHolder.getLocale();
    // try {
    // defaultDatePattern = ResourceBundle.getBundle("ApplicationResources", locale)
    // .getString("date.format");
    // } catch (MissingResourceException mse) {
    // defaultDatePattern = "MM/dd/yyyy";
    // }
    // return defaultDatePattern;
    return "yyyy-MM-dd";
  }

  /**
   * 这种方法尝试将一个oracle格式化日期形式(dd-MM-yyyy).
   * 
   * @param aDate 日期从数据库作为一个字符串.
   * @return String 格式化字符串为ui.
   */
  public static final String getDate(Date aDate) {
    SimpleDateFormat df = null;
    String returnValue = "";

    if (aDate != null) {
      df = new SimpleDateFormat(getDatePattern());
      returnValue = df.format(aDate);
    }

    return (returnValue);
  }

  // public static final String getDate(String format,Date aDate) {
  // String returnValue = "";
  // if (aDate != null) {
  // SimpleDateFormat df = new SimpleDateFormat(format);
  // returnValue = df.format(aDate);
  // }
  // return (returnValue);
  // }
  /**
   * 根据指定输入生成的一个字符串表示一个日期/时间格式.
   * 
   * @param aMask the 日期模式字符串.
   * @param strDate a 约定的一个字符串表示.
   * @return Date 返回一个转换日期对象.
   * @throws ParseException
   */
  public static final Date convertStringToDate(String aMask, String strDate) throws ParseException {
    SimpleDateFormat df = null;
    Date date = null;
    df = new SimpleDateFormat(aMask);
    try {
      date = df.parse(strDate);
    } catch (ParseException pe) {
      // log.error("ParseException: " + pe);
      throw new ParseException(pe.getMessage(), pe.getErrorOffset());
    }

    return (date);
  }

  /**
   * 该方法返回当前日期时间格式: MM/dd/yyyy HH:MM.
   * 
   * @param theTime 当前时间.
   * @return String 当前的日期/时间.
   */
  public static String getTimeNow(Date theTime) {
    return getDateTime(timePattern, theTime);
  }

  /**
   * 该方法返回当前日期时间格式: HH:mm:ss
   * 
   * @author niuhe 20130322
   * @param theTime 当前时间.
   * @return String 当前时间：HH:mm:ss
   */
  public static String getTime(Date theTime) {
    return getDateTime(timePatternChina, theTime);
  }

  /**
   * 该方法返回的当前日期格式: MM/dd/yyyy.
   * 
   * @return Calendar 返回当前日期.
   * @throws ParseException
   */
  public static Calendar getToday() throws ParseException {
    Date today = new Date();
    SimpleDateFormat df = new SimpleDateFormat(getDatePattern());

    // This seems like quite a hack (date -> string -> date),
    // but it works ;-)
    String todayAsString = df.format(today);
    Calendar cal = new GregorianCalendar();
    cal.setTime(convertStringToDate(todayAsString));

    return cal;
  }


  /**
   * 这种方法生成的一个指定的格式输入的字符串表示一个日期基于系统属性的'dateFormat'.
   * 
   * @param aDate 日期对象.
   * @return String 一个字符串表示的日期.
   */
  public static final String convertDateToString(Date aDate) {
    return getDateTime(getDatePattern(), aDate);
  }

  /**
   * 这个方法将一个字符转为使用datePattern日期.
   * 
   * @param strDate 要转换的日期(MM/dd/yyyy).
   * @return Date 返回日期对象.
   * @throws ParseException
   */
  public static Date convertStringToDate(String strDate) throws ParseException {
    Date aDate = null;
    try {
      aDate = convertStringToDate(getDatePattern(), strDate);
    } catch (ParseException pe) {
      pe.printStackTrace();
      throw new ParseException(pe.getMessage(), pe.getErrorOffset());

    }

    return aDate;
  }

  public static Map<String, String> getTodayMap() {
    Map<String, String> map = new HashMap<String, String>();
    String dateTime = DateUtil.getDateTime(DateUtil.dateTimePatternChina, new Date());
    map.put("year", dateTime.substring(0, 4));
    map.put("month", dateTime.substring(5, 7));
    map.put("day", dateTime.substring(8, 10));
    map.put("quarter",
        String.valueOf(DateUtil.getQuarter(Integer.parseInt(dateTime.substring(5, 7)))));
    map.put("date", dateTime.substring(0, 10));
    map.put("time", dateTime.substring(11, 19));
    map.put("dateTime", dateTime);
    return map;
  }

  /**
   * 返回某日期属于第几季度
   * 
   * @author fan 20070521
   * @param month 月.
   * @return int 返回第几个季度.
   */
  public static final int getQuarter(int month) {
    if (month <= 3) {
      return 1;
    } else if (month <= 6) {
      return 2;
    } else if (month <= 9) {
      return 3;
    } else if (month <= 12) {
      return 4;
    }
    return 0;
  }

  /**
   * 返回某日期属于 上半年 下半年.
   * 
   * @author fan 20070521
   * @param month 月.
   * @return int 1 = 上半年 2=下半年.
   */
  public static final int getMiddleYear(int month) {
    if (month <= 6) {
      return 1;
    } else if (month <= 12) {
      return 2;
    }
    return 0;
  }
  /**
   * xiewenda long 型数据转换为时间
   * @param time
   * @return
   */
  public static String formatDate(Long time) {
    if (time == null)
      return "不详";
    DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
    return df.format(new Date(time));
  }

  public static String formatTime(Long time) {
    if (time == null)
      return "不详";
    DateFormat df = new SimpleDateFormat("HH:mm:ss");
    return df.format(new Date(time));
  }

  public static String formatDateTime(Long time) {
    if (time == null)
      return "不详";
    DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    return df.format(new Date(time));
  }
}
