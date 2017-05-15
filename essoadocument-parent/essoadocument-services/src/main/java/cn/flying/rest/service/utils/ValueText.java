package cn.flying.rest.service.utils;


public class ValueText extends Value<String> {
  private static final long serialVersionUID = 6L;

  public ValueText() {}

  public ValueText(String s) {
    super(s);
  }

  @Override
  public TYPE getType() {
    return TYPE.TEXT;
  }

  public void contact(String s) {
    value += s;
  }

  @Override
  public ValueText clone() {
    ValueText v = new ValueText(value);
    v.relation = relation;
    return v;
  }

}
