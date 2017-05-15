package cn.flying.rest.service.utils;

import java.sql.Date;
import java.sql.Time;

public class ValueTime extends Value<Time> {
  private static final long serialVersionUID = 7L;

  public ValueTime() {}

  public ValueTime(long time) {
    super(new Time(time));
  }

  public ValueTime(Date date) {
    this(date.getTime());
  }

  public ValueTime(Time d) {
    super(d);
  }

  public ValueTime(String s) {
    // value = Time.valueOf(s);
    if (null != s && !"".equals(s)) {
      value = Time.valueOf(s);
    } else if (s.equals("")) {// jiangjien 20110616 add
      value = null;
    } else {
      value = Time.valueOf("00:00:00");
    }
  }

  @Override
  public TYPE getType() {
    return TYPE.TIME;
  }

  @Override
  public ValueTime clone() {
    ValueTime v = new ValueTime(value);
    v.relation = relation;
    return v;
  }


}
