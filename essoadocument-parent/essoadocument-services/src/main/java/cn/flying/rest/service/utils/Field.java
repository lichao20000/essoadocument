package cn.flying.rest.service.utils;

import java.util.ArrayList;
import java.util.Vector;

import org.w3c.dom.Document;
import org.w3c.dom.Element;



// @作者 黄本华
// @版本 1.0 2005-11-1
// @说明 这是一个描述
// Pair<namespace, identifier>
// 其中的identifier就是tag的identifier,如果出现重复,则用namespace区分开.
// 所以tag的identifier如果是单独命名的,
// 那么一定要是identifier在同一个空间下没有重复,否则将无法区分.
public final class Field extends Vector<Pair<String, String>> implements ICompareObject {
  public Object relation = null;

  public static Field SYSID() {
    return new Field(SYSID);
  }

  public boolean isSYSID() {
    if (size() != 1)
      return false;
    return get(0).equals(SYSID.get(0));
  }

  private static Field SYSID = null;
  static {
    SYSID = new Field();
    SYSID.add(null, "");
  }
  private static final long serialVersionUID = -200511300030780808L;

  public Field() {}

  public Field(Field f) {
    super();
    this.relation = f.relation;
    this.addAll(f);
  }

  public Field(String s) {
    if (s == null)
      return;
    if (s.equals(""))
      return;
    ArrayList<String> array = new ArrayList<String>();
    int j = -1;
    while ((j = s.indexOf(".")) >= 0) {
      array.add(s.substring(0, j++));
      s = s.substring(j);
      if (s.length() < 1)
        break;
    }
    if (s.length() > 0) {
      array.add(s);
    }
    for (String s1 : array) {
      s = "";
      j = s1.indexOf(":");
      if (j > 0) {
        s = s1.substring(0, j++);
        s1 = s1.substring(j);
      }
      add(s, s1);
    }
  }

  public boolean add(String namespace, String identifier) {
    // System.out.println(identifier + "+" + structure);
    Pair<String, String> p = new Pair<String, String>(namespace, identifier);
    return add(p);
  }

  public boolean add(String identifier) {
    return add(null, identifier);
  }

  public String toString() {
    if (size() < 1)
      return "";
    String name = "";
    for (Pair<String, String> p : this) {
      name += "." + toString(p);
    }
    return name.substring(1);
  }

  public boolean isChildFieldOf(Field f) {
    if (f == null || f.isEmpty())
      return false;
    int i = 0;
    for (Pair<String, String> p : this) {
      Pair<String, String> p2 = f.get(i);
      if (p2 == null)
        return true;
      if (!p.equals(p2))
        return false;
      i++;
    }
    return true;
  }

  public boolean equals(Object o) {
    if (o == this)
      return true;
    if (o == null || !(o instanceof Field))
      return false;
    Field f = (Field) o;
    int l1 = size();
    if (f.size() != l1)
      return false;
    for (int i = 0; i < l1; i++) {
      if (!this.get(i).equals(f.get(i)))
        return false;
    }
    return true;
  }

  // 将field 中的 pair 数据转换为字符串方式
  public static String toString(Pair<String, String> p) {
    if (p == null)
      return "";
    String s = "";
    s += ((p.left == null || p.left.trim().equals("")) ? "" : p.left + ":");
    s += p.right;
    return s;
  }

  // 将字符串方式转换为field中的Pair
  public static Pair<String, String> toPair(String s) {
    int pos = s.indexOf(":");
    if (pos < 0) {
      return new Pair<String, String>(null, s);
    } else {
      return new Pair<String, String>(s.substring(0, pos).trim(), s.substring(pos + 1).trim());
    }
  }

  // hashcode
  public int hashCode() {
    long hashcode = 0;
    float i = (float) (size() + 3.5);
    for (Pair<String, String> p : this) {
      if (p == null)
        continue;
      if (p.left != null)
        hashcode += p.left.hashCode() * (i--);
      if (p.right != null)
        hashcode += p.right.hashCode() * (i--);
    }
    return (int) (hashcode / 5);
  }

  /**
   * 获取最后一个namespace
   * 
   * @return
   */
  public String getLastNamespace() {
    String namespace = null;
    for (Pair<String, String> p : this) {
      if (this.firstElement().equals(p)) {
        namespace = p.left;
      } else if (p.left == null || p.left.equals("")) {

      } else {
        namespace = p.left;
      }
    }
    return namespace;
  }

  /**
   * 获取指定namespace下的identifier 例如获取ES:estitle.DC:date.title.estitle.k:L 的 DC 下的identifier
   * 为date.title.estitle
   * 
   * @param namespace
   * @return
   */
  public String getIdentifier(String namespace) {
    String identifier = "";
    boolean hasGetNamespace = false;
    for (Pair<String, String> p : this) {
      if (hasGetNamespace) {
        if (p.left == null || p.left.equals("")) {
          identifier += "." + p.right;
        } else {
          break;
        }
      } else {
        if (p.left == null)
          continue;
        if (p.left.equals(namespace)) {
          hasGetNamespace = true;
          identifier = p.right;
        }
      }
    }
    return identifier;
  }

  /**
   * 获取identifier的前缀identifier,例如：date.createdate -> date
   * 
   * @param identifier
   * @return
   */
  public static String getPreIdentifier(String identifier) {
    String preIdentifier = "";
    Field f = new Field(identifier);
    for (Pair<String, String> p : f) {
      if (!(f.lastElement().equals(p))) {
        preIdentifier += "." + p.right;
      }
    }
    if (preIdentifier.equals(""))
      return "";
    return preIdentifier.substring(1);
  }

  public Compare.OBJECTTYPE typeOfCompareObject() {
    return Compare.OBJECTTYPE.Field;
  }

  public Element toElement(Document dom) {
    Element ele = Condition.NodeType.field.create(dom);
    ele.appendChild(dom.createTextNode(this.toString()));
    return ele;
  }
}
