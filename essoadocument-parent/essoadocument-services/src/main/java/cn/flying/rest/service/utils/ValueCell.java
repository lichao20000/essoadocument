package cn.flying.rest.service.utils;

import java.io.Serializable;

public class ValueCell implements Serializable {
  private static final long serialVersionUID = 1L;
  private static final String NUMBER_REGEX = "^[+|-]?\\d+$";
  private static final String FLOAT_REGEX = "^[+|-]?\\d+\\.\\d+$";
  private static final String DATE_REGEX_YYYY_MM_DD =
      "(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)";
  private static final String DATE_REGEX_YYYYMMDD =
      "(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})/(((0[13578]|1[02]))/(0[1-9]|[12][0-9]|3[01])|((0[469]|11))/(0[1-9]|[12][0-9]|30)|(02)/(0[1-9]|[1][0-9]|2[0-8])))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))/02/29)";
  private static final String BOOLEAN_REGEX = "^(是|否)$";
  private static final String TIME_REGEX_HH_MM_SS =
      "^(0\\d{1}|1\\d{1}|2[0-3]):[0-5]\\d{1}:([0-5]\\d{1})$";
  private static final String SPECIAL_CHAR_REGEX = "('|\"|\\\\)+";
  private int type = -1;
  private int length;
  private String value;
  private Boolean isContainsSpecialChar;
  private boolean isNull = true;

  public ValueCell() {}

  public ValueCell(String value) {
    this.value = value.trim();
    if (!isEmpty()) {
      isNull = false;
      init();
    } else {
      isContainsSpecialChar = false;
    }
  }

  public boolean isNull() {
    return isNull;
  }

  public void setValue(String value) {
    this.value = value.trim();
    if (!isEmpty()) {
      isNull = false;
      setLength();
    } else {
      isContainsSpecialChar = false;
    }
  }

  public void setIsContainsSpecialChar(boolean isContainsSpecialChar) {
    this.isContainsSpecialChar = isContainsSpecialChar;
  }

  public void init() {
    setLength();
    initType();
  }

  private void setLength() {
    length = value.replaceAll("[^\\x00-\\xff]", "**").length();
  }

  private void initType() {
    if (!isIntType() && !isFloatType() && !isDateType() && !isTimeType() && !isBooleanType()) {
      setType(ValueType.TEXT.ordinal());
    }
  }

  public void setType(int type) {
    this.type = type;
  }

  public int getLength() {
    return length;
  }

  public int getType() {
    return type;
  }

  public String getValue() {
    return value;
  }

  private boolean isInitType() {
    return getType() != -1;
  }

  public boolean isIntType() {
    boolean flag = false;
    if (isInitType()) {
      flag = (getType() == ValueType.NUMBER.ordinal());
    } else {
      flag = getValue().matches(NUMBER_REGEX);
      if (flag) {
        setType(ValueType.NUMBER.ordinal());
      }
      return flag;
    }
    return flag;
  }

  public boolean isFloatType() {
    boolean flag = false;
    if (isInitType()) {
      flag = (getType() == ValueType.FLOAT.ordinal());
    } else {
      flag = getValue().matches(FLOAT_REGEX);
      if (flag) {
        setType(ValueType.FLOAT.ordinal());
      }
    }
    return flag;
  }

  public boolean isDateType() {
    boolean flag = false;
    if (isInitType()) {
      flag = (getType() == ValueType.DATE.ordinal());
    } else {
      flag = (getValue().matches(DATE_REGEX_YYYY_MM_DD) || getValue().matches(DATE_REGEX_YYYYMMDD));
      if (flag) {
        setType(ValueType.DATE.ordinal());
      }
    }
    return flag;
  }

  public boolean isBooleanType() {
    boolean flag = false;
    if (isInitType()) {
      flag = (getType() == ValueType.BOOL.ordinal());
    } else {
      flag = getValue().matches(BOOLEAN_REGEX);
      if (flag) {
        setType(ValueType.BOOL.ordinal());
      }
      return flag;
    }
    return flag;
  }

  public boolean isTimeType() {
    boolean flag = false;
    if (isInitType()) {
      flag = (getType() == ValueType.TIME.ordinal());
    } else {
      flag = getValue().matches(TIME_REGEX_HH_MM_SS);
      if (flag) {
        setType(ValueType.TIME.ordinal());
      }
    }
    return flag;
  }

  public boolean isContainsSpecialChar() {
    if (isContainsSpecialChar == null) {
      isContainsSpecialChar = getValue().matches(SPECIAL_CHAR_REGEX);
    }
    return isContainsSpecialChar.booleanValue();
  }

  public boolean isEmpty() {
    return (value == null || "".equals(value) || "".equals(value.trim()));
  }
}
