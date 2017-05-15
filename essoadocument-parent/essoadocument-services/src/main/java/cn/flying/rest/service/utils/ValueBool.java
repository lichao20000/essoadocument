package cn.flying.rest.service.utils;



// @作者 黄本华
// @说明 这是一个布尔值类
public class ValueBool extends Value<Boolean> {
  private static final long serialVersionUID = 1L;

  public ValueBool() {}

  public ValueBool(String s) {
    value = false;
    if (s == null)
      return;
    s = s.trim().toLowerCase();
    if ("true".equals(s)) {
      value = true;
    } else if ("t".equals(s)) {
      value = true;
    } else if ("是".equals(s)) {
      value = true;
    } else if ("真".equals(s)) {
      value = true;
    } else if ("yes".equals(s)) {
      value = true;
    } else if ("1".equals(s)) {
      value = true;
    }
    // jiangjien 20110616 add
    else if ("否".equals(s) || "0".equals(s) || "no".equals(s)) {
      value = false;
    } else {
      value = null;
    }
  }

  public ValueBool(Boolean b) {
    super(b);
  }

  @Override
  public TYPE getType() {
    return TYPE.BOOL;
  }

  public boolean isTrue() {
    if (value == null)
      return false;
    return value.booleanValue();
  }

  @Override
  public ValueBool clone() {
    ValueBool v = new ValueBool(value);
    v.relation = relation;
    return v;
  }
}
