package cn.flying.rest.service.utils;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;



/**
 * 本类用来产生简单比较式： 如 dc:title like "%me%" es:page.count >= 100 a + c + d.f < 2000 a * c + f > 300
 * subText(c.f, 0, 20) = "test" ...
 * 
 * 比较式设置与前一个比较式的关联关系，缺省为AND。
 * */

public class Compare extends Pair<ICompareObject, ICompareObject> implements ICompare {
  public TYPE type = TYPE.equal;
  public boolean not = false;
  /** xiaoxiong 20140731 添加取反 **/
  public Connector connector = Connector.and;
  public String leftBrackets = null;// add jinwei 20110308
  public String rightBrackets = null;// add jinwei 20110308

  public enum OBJECTTYPE {
    Compute, Field, Value
  }
  public enum TYPE {
    knull("is null", "is null"), equal("=", "e"), lessThan("<", "l"), lessEqual("<=", "le"), greaterEqual(
        ">=", "ge"), greaterThan(">", "g"), notEqual("<>", "n"), like("LIKE", "k"), notLike(
        "NOT LIKE", "nk"), leftBrackets("(", "lb"), // add jinwei 20110308
    rightBrackets(")", "rb");// add jinwei 20110308
    String brif = "";
    public String ab = "";
    private TYPE reverse;

    public TYPE getReverse() {
      return this.reverse;
    }

    private TYPE(String ab, String bf) {
      this.ab = " " + ab + " ";
      this.brif = bf;
      // this.reverse = reverse;
    }
  }

  public Compare(ICompareObject obj1, TYPE typ, ICompareObject obj2) {
    this.left = obj1;
    this.right = obj2;
    this.type = typ;
  }

  public Compare(TYPE typ) {
    this.type = typ;
  }

  public Compare() {}

  public Compare setType(TYPE typ) {
    this.type = typ;
    return this;
  }

  public Compare setAnd() {
    this.connector = Connector.and;
    return this;
  }

  public Compare setOr() {
    this.connector = Connector.or;
    return this;
  }

  public Compare setAnd(boolean isAnd) {
    if (isAnd)
      return setAnd();
    return setOr();
  }

  public Compare setNot() {
    // this.type = this.type.getReverse();
    this.not = true;
    return this;
  }

  public Connector getConnector() {
    return this.connector;
  }

  public Compare setLeftBrackets(String leftBrackets) {
    this.leftBrackets = leftBrackets;
    return this;
  }

  public Compare setRightBrackets(String rightBrackets) {
    this.rightBrackets = rightBrackets;
    return this;
  }

  public Element toElement(Document dom) {
    Element ele = Condition.NodeType.compare.create(dom);
    if (this.getLeftBrackets() != null)
      ele.appendChild(bracketsToElement(dom, "leftBrackets"));// add jinwei 20110309
    boolean brif = (ele.getNodeName().equals(Condition.NodeType.compare.Ab));
    Condition.setNodeAttribute(ele, brif ? "c" : "connectAs", brif ? this.connector == null ? ""
        : this.connector.Ab() : this.connector == null ? "" : this.connector.name());
    Condition.setNodeAttribute(ele, brif ? "t" : "type", brif ? this.type.brif : this.type.name());
    ele.appendChild(this.left.toElement(dom));
    ele.appendChild(this.right.toElement(dom));
    if (this.getRightBrackets() != null)
      ele.appendChild(bracketsToElement(dom, "rightBrackets"));// add jinwei 20110309
    return ele;
  }

  /**
   * @author jinwei 20110309 解析左右括号用
   * @param dom
   * @param type
   * @return
   */
  public Element bracketsToElement(Document dom, String type) {
    Element ele = Condition.NodeType.brackets.create(dom);
    if (ele.getNodeName().equals(Condition.NodeType.brackets.Ab)) {
      if (type.equals("leftBrackets")) {
        Condition.setNodeAttribute(ele, "t", TYPE.leftBrackets.ab);
      } else {
        Condition.setNodeAttribute(ele, "t", TYPE.rightBrackets.ab);
      }
    }
    return ele;
  }

  // edit jinwei 20110310 处理错误的拼接
  public Compare(Element element) {
    NamedNodeMap map = element.getAttributes();
    boolean brif = (element.getNodeName().equals(Condition.NodeType.compare.Ab));
    String cValue = map.getNamedItem("c").getNodeValue();
    String s = "";
    if (!cValue.equals("")) {
      if (cValue.equals("&")) {
        this.connector = Connector.and;
      } else {
        this.connector = Connector.or;
      }
    }
    // String s = brif?this.connector == null?"":this.connector.Ab():this.connector == null
    // ?"":this.connector.name();//edit jinwei 20110311
    // if(!s.equals(Condition.getNodeAttribute(map, brif?"c":"connectAs")))this.connector =
    // Connector.or;
    s = Condition.getNodeAttribute(map, brif ? "t" : "type");
    for (TYPE t : TYPE.values()) {
      if (brif) {
        if (!t.brif.equals(s))
          continue;
      } else {
        if (!t.name().equals(s))
          continue;
      }
      this.type = t;
      break;
    }
    // add jinwei 20110309 --------------------------
    if (null != element.getFirstChild().getAttributes().getNamedItem("t")) {
      this.leftBrackets = element.getFirstChild().getAttributes().getNamedItem("t").getNodeValue();
    }

    NodeList nl = element.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
      if (nl.item(i).getNodeName().equals(Condition.NodeType.field.Ab)) {
        this.left = convertToObject((Element) nl.item(i));
      } else if (nl.item(i).getNodeName().equals(Condition.NodeType.value.Ab)) {
        this.right = convertToObject((Element) nl.item(i));
      }
    }
    if (element.getLastChild().getNodeName().equals("b")
        && null != element.getLastChild().getAttributes().getNamedItem("t")) {
      this.rightBrackets = element.getLastChild().getAttributes().getNamedItem("t").getNodeValue();
    }
    // add jinwei 20110309 --------------------------
    // this.a = convertToObject((Element)element.getFirstChild());
    // this.b = convertToObject((Element)element.getLastChild());
  }

  final static ICompareObject convertToObject(Element element) {
    Condition.NodeType ntyp = Condition.NodeType.typeOf(element.getNodeName());
    switch (ntyp) {
      case compute:
        return new Compute(element);
      case field:
        return new Field(element.getFirstChild() != null ? element.getFirstChild().getNodeValue()
            : null);// edit jinwei 20110310
      case value:
        NamedNodeMap map = element.getAttributes();
        String s = Condition.getNodeAttribute(map, "t");
        if (s == null)
          s = Condition.getNodeAttribute(map, "type");
        for (Value.TYPE t : Value.TYPE.values()) {
          if (s.equals(t.name()) || s.equals(t.Ab())) {
            // 对null的冗错处理.fan 20070917
            Node node = element.getFirstChild();
            return (ICompareObject) ValueText.toValue(t, node == null ? "" : node.getNodeValue());
          }
        }
      default:
        return null;
    }
  }



  public String toString() {
    // huying 20110623 修复不等和不包含时丢失空数据的bug
    StringBuffer buffer = new StringBuffer();
    if (this.getLeftBrackets() != null)
      buffer.append("" + this.getLeftBrackets() + "");// add jinwei 20110308
    // chenzhenhai 20110914 注掉下面
    // if((this.b==null || "".equals(this.b.toString())) &&
    // (this.type==TYPE.equal||this.type==TYPE.notEqual)){
    // tostr(buffer, this.a);
    // buffer.append(" IS ");
    // if(this.type==TYPE.notEqual)buffer.append("NOT ");
    // buffer.append("NULL");
    // } else if(this.b != null && !"".equals(this.b.toString())){
    // if(this.type == TYPE.notEqual || this.type == TYPE.notLike){
    // buffer.append(" ( ") ;
    // tostr(buffer, this.a);
    // buffer.append(this.type.ab);
    // tostr(buffer, this.b);
    // buffer.append(" or ") ;
    // tostr(buffer, this.a);
    // buffer.append(" is null ");
    // buffer.append(" ) ") ;
    // } else {
    // tostr(buffer, this.a);
    // buffer.append(this.type.ab);
    // tostr(buffer, this.b);
    // }
    // }else{
    if (this.not)
      buffer.append(" NOT ");
    /** xiaoxiong 20140731 添加取反 **/
    tostr(buffer, this.left);
    buffer.append(this.type.ab);
    tostr(buffer, this.right);
    // }
    // huying 20110623 修复不等和不包含时丢失空数据的bug end
    if (this.getRightBrackets() != null)
      buffer.append("" + this.getRightBrackets() + "");// add jinwei 20110308
    return buffer.toString();
  }

  // zhangwenbin 20110222 为利用统计服务
  public String getA() {
    return this.left.toString();
  }

  public String getB() {
    return this.right.toString();
  }

  public String getType() {
    return this.type.name();
  }

  // zhangwenbin 2011022 end

  static void tostr(StringBuffer buffer, ICompareObject obj) {
    switch (obj.typeOfCompareObject()) {
      case Field:
        // liukaiyuan 修复中括号无法检索的问题
        buffer.append("-$");
        buffer.append(obj.toString());
        buffer.append("$-");
        return;
      case Value:
        if (obj instanceof ValueText) {
          buffer.append('"');
          buffer.append(obj.toString());
          buffer.append('"');
          return;
        }
      default:
        break;
    }
    buffer.append(obj.toString());
  }

  public String getLeftBrackets() {
    return leftBrackets;
  }

  public String getRightBrackets() {
    return rightBrackets;
  }

  public static void main(String[] args) {
    Compare.TYPE.valueOf("like");

  }
}
