package cn.flying.rest.service.utils;

import java.util.ArrayList;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.NodeList;

import cn.flying.rest.service.utils.Condition.NodeType;



/**
 * 本类用于比较式中的简单计算，如基本的加减乘除和字符串操作，转换操作等 + --> add - --> sub * --> mul / --> div
 * */

public class Compute extends ArrayList<ICompareObject> implements ICompareObject {
  private static final long serialVersionUID = 3112342341241234L;

  public enum TYPE {
    add('+'), sub('-'), mul('*'), div('/'), concat('+'), abs, ceil, floor, trunc, round, exp, ln, log, square, sqrt, power, rand, sign, pi, nvl, ascii, tochar, indexof, substring, replace, length, lower, upper, space, ltrim, rtrim, sysdate, datetostring, timetostring, datepart, stringtodate, sin, cos, tan, asin, acos, atan, seconddiff, daydiff, secondadd, dayadd;
    public boolean isMath = false;
    private char ab = ',';

    private TYPE() {}

    private TYPE(char ab) {
      this.isMath = true;
      this.ab = ab;
    }
  }

  public TYPE type = TYPE.add;

  public Compare.OBJECTTYPE typeOfCompareObject() {
    return Compare.OBJECTTYPE.Compute;
  }

  //
  public Compute() {}

  public Compute(TYPE type) {
    this.type = type;
  }

  public Compute setType(TYPE type) {
    this.type = type;
    return this;
  }


  public Element toElement(Document dom) {
    Element ele = Condition.NodeType.compute.create(dom);
    if (ele.getNodeName().equals(NodeType.compute.Ab)) {
      Condition.setNodeAttribute(ele, "t", this.type.name());
    } else {
      Condition.setNodeAttribute(ele, "type", this.type.name());
    }
    for (ICompareObject obj : this) {
      ele.appendChild(obj.toElement(dom));
    }
    return ele;
  }

  public Compute(Element element) {
    NamedNodeMap map = element.getAttributes();
    String s = Condition.getNodeAttribute(map, "t");
    if (s == null)
      s = Condition.getNodeAttribute(map, "type");
    this.type = TYPE.valueOf(s);
    if (this.type == null)
      this.type = TYPE.add;
    NodeList nlist = element.getChildNodes();
    for (int i = 0, stop = nlist.getLength(); i < stop; i++) {
      Element n = (Element) nlist.item(i);
      NodeType ntyp = NodeType.typeOf(n.getNodeName());
      if (ntyp == null)
        continue;
      this.add(Compare.convertToObject(n));
    }
  }

  public String toString() {
    StringBuffer buffer = null;
    for (ICompareObject obj : this) {
      if (buffer == null) {
        buffer = new StringBuffer(this.type.isMath ? "" : this.type.name());
        buffer.append('(');
      } else {
        buffer.append(this.type.ab);
      }
      Compare.tostr(buffer, obj);
    }
    if (buffer == null)
      return "";
    buffer.append(')');
    return buffer.toString();
  }
}
