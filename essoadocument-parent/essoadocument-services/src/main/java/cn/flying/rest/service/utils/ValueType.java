package cn.flying.rest.service.utils;


/**
 * @author huying
 *
 */
public enum ValueType {
  TEXT {// 文本类型
    public String getDescription() {
      return "文本";
    }
  },
  NUMBER {// 数值类型
    public String getDescription() {
      return "数值";
    }
  },
  DATE {// 日期类型
    public String getDescription() {
      return "日期";
    }
  },
  FLOAT {// 小数类型
    public String getDescription() {
      return "浮点";
    }
  },
  TIME {// 时间类型
    public String getDescription() {
      return "时间";
    }
  },
  BOOL {// 布尔类型
    public String getDescription() {
      return "布尔";
    }
  },
  CLOB {// add jin 20080818
    public String getDescription() {
      return "大字段";
    }
  },
  RESOURCE {// 资源类型
    public String getDescription() {
      return "资源";
    }
  };

  public abstract String getDescription();
}
