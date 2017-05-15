package cn.flying.rest.service.utils;



public class ValueNumber extends Value<Long> {
  private static final long serialVersionUID = 4L;

  public ValueNumber() {}

  public ValueNumber(Long d) {
    super(d);
  }

  public ValueNumber(long l) {
    super(l);
  }

  public ValueNumber(String s) {
    super();
    if (s == null)
      return;
    try {
      value = new Long(s);
    } catch (Exception e) {
    }
  }

  @Override
  public TYPE getType() {
    return TYPE.NUMBER;
  }


  public double getNumber() {
    if (value == null)
      return 0;
    return value.doubleValue();
  }

  @Override
  public ValueNumber clone() {
    ValueNumber v = new ValueNumber(value);
    v.relation = relation;
    return v;
  }

}
