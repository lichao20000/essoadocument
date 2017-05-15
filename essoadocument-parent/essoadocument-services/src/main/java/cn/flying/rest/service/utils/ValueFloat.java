package cn.flying.rest.service.utils;


public strictfp class ValueFloat extends Value<Double> {
  private static final long serialVersionUID = 3L;

  public ValueFloat() {}

  public ValueFloat(Double d) {
    super(d);
  }

  public ValueFloat(long l) {
    super((double) l);
  }

  public ValueFloat(String s) {
    super();
    if (s == null)
      return;
    try {
      value = new Double(s);
    } catch (Exception e) {
    }
  }

  @Override
  public TYPE getType() {
    return TYPE.FLOAT;
  }

  @Override
  public strictfp ValueFloat clone() {
    ValueFloat v = new ValueFloat(value);
    v.relation = relation;
    return v;
  }
}
