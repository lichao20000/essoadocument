package cn.flying.rest.service.utils;

import java.sql.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

public class ValueDate extends Value<Date> {
  private static final long serialVersionUID = 2L;

  public ValueDate() {}

  public static final DateFormat dateformate = new SimpleDateFormat();

  public ValueDate(Date d) {
    super(d);
  }

  public ValueDate(String s) {
    try {
      value = Date.valueOf(s);
    } catch (Exception e) {
    }
  }

  @Override
  public TYPE getType() {
    return TYPE.DATE;
  }

  @Override
  public ValueDate clone() {
    ValueDate v = new ValueDate(value);
    v.relation = relation;
    return v;
  }

  public static void main(String[] args) {
    System.out.println(new ValueDate("2005-12-1 6:7:8").toString());
  }
}
