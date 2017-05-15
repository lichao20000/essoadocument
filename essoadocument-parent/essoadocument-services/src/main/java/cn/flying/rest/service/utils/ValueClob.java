package cn.flying.rest.service.utils;


public class ValueClob extends Value<String> {
  private static final long serialVersionUID = -6142718463739100116L;

  public ValueClob() {

  }

  public ValueClob(String s) {

  }

  @Override
  public TYPE getType() {
    return TYPE.CLOB;
  }

  @Override
  public Value<String> clone() {
    ValueClob v = new ValueClob(value);
    v.relation = relation;
    return v;
  }

}
