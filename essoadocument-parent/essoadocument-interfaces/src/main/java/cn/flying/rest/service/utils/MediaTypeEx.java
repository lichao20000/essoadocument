package cn.flying.rest.service.utils;

import java.util.Map;

import javax.ws.rs.core.MediaType;

/**
 * resteasy中的MediaType扩展<br>
 * 提供直接的UTF8编码的MediaType
 * 从国齐之前搭建的平台中复制过来的
 * @author xiaoxiong 2014-3-12
 */
public class MediaTypeEx extends MediaType {
  public static final String APPLICATION_JSON_UTF8 = "application/json;charset=UTF-8";
  public static final String TEXT_PLAIN_UTF8 = "text/plain;charset=UTF-8";

  public MediaTypeEx() {
    super();
  }

  public MediaTypeEx(String type, String subtype, Map<String, String> parameters) {
    super(type, subtype, parameters);
  }

  public MediaTypeEx(String type, String subtype) {
    super(type, subtype);
  }

}
