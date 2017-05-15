package cn.flying.rest.service.utils;



/**
 * @see 该类为工具类，提供如下功能（如加入新功能请在此处标记）： 1、为结构字段类型 提供枚举标记； 2、为结构字段类型提供中文类型 与 数据库类型的标记转换 例如 布尔型 —> bool
 */
public class VALUETYPES {

  public static enum TYPE {
    TEXT {// 文本类型
      public String Ab() {
        return "_";
      }

      public String getDescription() {
        return "文本";
      }
    },
    NUMBER {// 数值类型
      public String Ab() {
        return "N";
      }

      public String getDescription() {
        return "数值";
      }
    },
    DATE {// 日期类型
      public String Ab() {
        return "D";
      }

      public String getDescription() {
        return "日期";
      }
    },
    FLOAT {// 小数类型
      public String Ab() {
        return "F";
      }

      public String getDescription() {
        return "浮点";
      }
    },
    TIME {// 时间类型
      public String Ab() {
        return "T";
      }

      public String getDescription() {
        return "时间";
      }
    },
    BOOL {// 布尔类型
      public String Ab() {
        return "B";
      }

      public String getDescription() {
        return "布尔";
      }
    },
    CLOB {// clob 大文本类型
      public String Ab() {
        return "C";
      }

      public String getDescription() {
        return "大文本";
      }
    },
    RESOURCE {// 资源类型
      public String Ab() {
        return "R";
      }

      public String getDescription() {
        return "资源";
      }
    };

    public abstract String Ab();

    public abstract String getDescription();

    public TYPE AbValueOf(String ab) {
      if (ab == null || ab.length() < 1)
        return TEXT;
      for (TYPE t : TYPE.values()) {
        if (ab.startsWith(t.Ab()))
          return t;
      }
      return TEXT;
    }
  }

  /**
   * @see 提供中文到 数据库类型的转换
   * @param typeValue
   * @return String
   */
  public static String convertTagType(String typeValue) {
    if (typeValue.contains(VALUETYPES.TYPE.CLOB.getDescription())) {
      return VALUETYPES.TYPE.CLOB.name();
    } else if (typeValue.contains(VALUETYPES.TYPE.TEXT.getDescription())) {
      return VALUETYPES.TYPE.TEXT.name();
    } else if (typeValue.contains(VALUETYPES.TYPE.NUMBER.getDescription())) {
      return VALUETYPES.TYPE.NUMBER.name();
    } else if (typeValue.contains(VALUETYPES.TYPE.BOOL.getDescription())) {
      return VALUETYPES.TYPE.BOOL.name();
    } else if (typeValue.contains(VALUETYPES.TYPE.DATE.getDescription())) {
      return VALUETYPES.TYPE.DATE.name();
    } else if (typeValue.contains(VALUETYPES.TYPE.FLOAT.getDescription())) {
      return VALUETYPES.TYPE.FLOAT.name();
    } else if (typeValue.contains(VALUETYPES.TYPE.RESOURCE.getDescription())) {
      return VALUETYPES.TYPE.RESOURCE.name();
    } else if (typeValue.contains(VALUETYPES.TYPE.TIME.getDescription())) {
      return VALUETYPES.TYPE.TIME.name();
    }
    return typeValue;
  }

}
