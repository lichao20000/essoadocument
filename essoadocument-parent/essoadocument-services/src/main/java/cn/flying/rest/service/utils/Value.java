package cn.flying.rest.service.utils;

import org.w3c.dom.Document;
import org.w3c.dom.Element;



// @作者 黄本华
// @版本 1.0 2005-11-1
// @说明 这是一个值对象的超类
@SuppressWarnings({"unchecked", "rawtypes", "serial"})
public abstract class Value<T extends Comparable> implements ICompareObject, Comparable<Value>,
    java.io.Serializable {
  public transient Object relation = null;

  public static TYPE convertToType(String s) {
    if (s == null)
      return null;
    s = s.trim().toUpperCase();
    for (TYPE t : TYPE.values()) {
      if (s.equals(t.name()))
        return t;
      if (s.equals(t.Ab()))
        return t;
    }
    return null;
  }

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
    CLOB {// add jin 20080818
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

    // huying 20110808 添加获取描述的抽象方法
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

  public T value = null;

  public Value() {}

  public Value(T t) {
    value = t;
  }

  public abstract TYPE getType();

  public final boolean isTypeOf(TYPE t) {
    return t == getType();
  }

  //
  public Value<T> setValue(T t) {
    this.value = t;
    return this;
  }

  //
  public final boolean equals(Object o) {
    if (o == this)
      return true;
    if (o == null)
      return false;
    if (!(o instanceof Value))
      return false;
    Value v = (Value) o;
    if (value == v.value)
      return true;
    if (value == null)
      return false;
    return value.equals(v.value);
  }

  public final boolean isSameType(Value obj) {
    if (obj == null)
      return false;
    return (obj.getType() == getType());
  }

  public String toString() {
    if (value == null)
      return "";
    return value.toString();

  }

  public boolean isNull() {
    return value == null;
  }

  public Value<T> setNull() {
    value = null;
    return this;
  }

  public int compareTo(Value b) {
    if (b == this)
      return 0;
    if (b == null)
      return 1;
    if (value == b.value)
      return 0;
    if (value == null)
      return -1;
    if (b.value == null)
      return 1;
    return value.compareTo(b.value);
  }

  public Compare.OBJECTTYPE typeOfCompareObject() {
    return Compare.OBJECTTYPE.Value;
  }

  public Element toElement(Document dom) {
    Element ele = Condition.NodeType.value.create(dom);
    if (ele.getNodeName().equals(Condition.NodeType.value.Ab)) {
      Condition.setNodeAttribute(ele, "t", this.getType().Ab());
    } else {
      Condition.setNodeAttribute(ele, "type", this.getType().name());
    }
    ele.appendChild(dom.createTextNode(this.toString()));
    return ele;
  }

  public final int hashCode() {
    if (value == null)
      return 0;
    return value.hashCode();
  }

  // test
  public static void main(String[] args) {
    String a = Value.COMPUTETYPE.EQUAL.getDescription();
    String b = Value.COMPUTETYPE.EQUAL.name();
    System.out.println(a);
    System.out.println(b);
    // Value<String> v1, v2;
    // v1 = new ValueText("a");
    // v2 = new ValueText(" a ".trim());
    // System.out.println(v1.equals(v2));
    // System.out.println(v1.compareTo(v2) == 0);
    // System.out.println(v1.hashCode() == v2.hashCode());
    // //
    // v2 = new ValueText("b");
    // System.out.println(v1.equals(v2) == false);
    // System.out.println(v1.compareTo(v2) < 0);
    // System.out.println(v1.hashCode() != v2.hashCode());

  }

  public abstract Value<T> clone();


  // 从ValueText移植过来 fan 20070312
  public static Value toValue(Value.TYPE typ, String s) {
    switch (typ) {
      case TEXT:
        return new ValueText(s);
      case RESOURCE:
        return new ValueResource(s);
      case NUMBER:
        return new ValueNumber(s);

      case DATE:
        return new ValueDate(s);
      case BOOL:
        return new ValueBool(s);
      case TIME:
        return new ValueTime(s);
      case FLOAT:
        return new ValueFloat(s);
      case CLOB:// add jin 20080818
        return new ValueClob(s);
    }
    return null;
  }

  public static enum COMPUTETYPE {
    EQUAL {
      public int value() {
        return 0;
      }

      public String getDescription() {
        return "相等";
      }
    },
    SUM {
      public int value() {
        return 1;
      }

      public String getDescription() {
        return "求和";
      }
    },
    STATISTICS {
      public int value() {
        return 3;
      }

      public String getDescription() {
        return "计数";
      }
    },
    MIN2MAX {
      public int value() {
        return 2;
      }

      public String getDescription() {
        return "求起止值";
      }
    };
    public abstract String getDescription();

    abstract int value();
  }

  public static enum STRUCTURETYPE {
    document {
      public int value() {
        return 0;
      }

      public String getDescription() {
        return "文书档案";
      }
    },
    contract {
      public int value() {
        return 1;
      }

      public String getDescription() {
        return "合同档案";
      }
    },
    project {
      public int value() {
        return 2;
      }

      public String getDescription() {
        return "工程档案";
      }
    },
    accounting {
      public int value() {
        return 3;
      }

      public String getDescription() {
        return "会计档案";
      }
    },
    purchase {
      public int value() {
        return 4;
      }

      public String getDescription() {
        return "采购档案";
      }
    },
    technical {
      public int value() {
        return 5;
      }

      public String getDescription() {
        return "科技档案";
      }
    },
    carrierfiles {
      public int value() {
        return 6;
      }

      public String getDescription() {
        return "多种载体档案";
      }
    },
    personal {
      public int value() {
        return 7;
      }

      public String getDescription() {
        return "员工档案";
      }
    },
    auditfiles {
      public int value() {
        return 8;
      }

      public String getDescription() {
        return "审计档案";
      }
    };
    public abstract String getDescription();

    abstract int value();
  }

  // xuxinjian 20121114 添加日志枚举类
  public static enum LOGTYPE {
    LOGIN_OUT {
      public int value() {
        return 1;
      }

      public String getDescription() {
        return "用户登陆日志";
      }
    },
    FUNCTION_ACCESS {
      public int value() {
        return 2;
      }

      public String getDescription() {
        return "功能访问日志";
      }
    },
    FUNCTION_OPERATION {
      public int value() {
        return 3;
      }

      public String getDescription() {
        return "功能操作日志";
      }
    },
    DATA_INTERFACE {
      public int value() {
        return 4;
      }

      public String getDescription() {
        return "数据接口日志";
      }
    };
    public abstract String getDescription();

    public abstract int value();
  }
  // xuxinjian 20121115 添加通知信息枚举类
  public static enum MESSAGE {
    USER_ID {
      public String value() {
        return "userid";
      }

      public String getDescription() {
        return "用户ID:";
      }
    },
    USER_NAME {
      public String value() {
        return "username";
      }

      public String getDescription() {
        return "用户名:";
      }
    },
    DEPT_LDAP_CODE {
      public String value() {
        return "deptldapcode";
      }

      public String getDescription() {
        return "用户部门:";
      }
    },
    IP {
      public String value() {
        return "ip";
      }

      public String getDescription() {
        return "IP地址:";
      }
    },
    AUDITTIME {
      public String value() {
        return "auditTime";
      }

      public String getDescription() {
        return "时间:";
      }
    },
    ACCESS {
      public String value() {
        return "access";
      }

      public String getDescription() {
        return "功能访问:";
      }
    },
    OPERATION {
      public String value() {
        return "operation";
      }

      public String getDescription() {
        return "功能操作:";
      }
    },
    OPERATION_DETAIL {
      public String value() {
        return "operationdetail";
      }

      public String getDescription() {
        return "操作明细:";
      }
    };
    public abstract String getDescription();

    public abstract String value();
  }
}
