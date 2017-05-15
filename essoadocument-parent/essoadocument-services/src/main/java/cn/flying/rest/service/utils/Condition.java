package cn.flying.rest.service.utils;

import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;



// 用来表现检索的条件
// @author 黄本华
// @version 1.0 2005-12-1
// 用来装载比较式compare和子条件condition
// 可以设置本条件是否取反not
// 可以设置与前一个条件式或者比较式的关联关系
// 条件式下的第一个比较式将忽略联结方式
public final class Condition extends ArrayList<ICompare> implements ICompare {
  public boolean not = false;
  public boolean isFalse = false;
  public Connector connector = Connector.and;

  //
  public Condition(boolean not) {
    this.not = not;
  }

  public Condition() {}

  // fan 2007-01-07
  public static enum TYPE {
    equalCondition("equalCondition"), notEqualCondition("notEqualCondition");
    private String ab;
    private Condition condition = new Condition();
    private String conditionSql;

    public Condition getCondition() {
      return condition;
    }

    public String getConditionSql() {
      return conditionSql;
    }

    private TYPE(String ab) {
      this.ab = ab;
      if (this.ab.equals("equalCondition")) {
        condition.add(new Compare(new ValueNumber(1), Compare.TYPE.equal, new ValueNumber(1)));
        conditionSql = "1=1";
      } else {
        condition.add(new Compare(new ValueNumber(1), Compare.TYPE.notEqual, new ValueNumber(1)));
        conditionSql = "1<>1";
      }
    }
  }

  //
  public Condition setNot(boolean not) {
    this.not = not;
    return this;
  }

  public Condition setNot() {
    return setNot(true);
  }

  public Condition setAnd() {
    this.connector = Connector.and;
    return this;
  }

  public Condition setOr() {
    this.connector = Connector.or;
    return this;
  }

  private static final long serialVersionUID = 15456232412323423L;

  public ICompare setAnd(boolean isAnd) {
    if (isAnd)
      return setAnd();
    return setOr();
  }

  public Connector getConnector() {
    return this.connector;
  }

  public static enum NodeType {
    condition("c"), compare("j"), compute("e"), field("f"), brackets("b"), // add jinwei 20110309
                                                                           // 处理括号
    value("v");
    public String Ab = "";

    private NodeType(String ab) {
      this.Ab = ab;
    }

    public Element create(Document dom) {
      if (dom.getFirstChild() == null)
        return dom.createElement(this.Ab);
      return dom.createElement(this.name());
    }

    public static NodeType typeOf(String node) {
      for (NodeType t : NodeType.values()) {
        if (t.Ab.equals(node))
          return t;
        if (t.name().equals(node))
          return t;
      }
      return null;
    }
  }

  // 转换为DOM
  public Document toDom() {
    DocumentBuilderFactory dombuilderfactory = DocumentBuilderFactory.newInstance();
    try {
      Document dom = dombuilderfactory.newDocumentBuilder().newDocument();
      dom.appendChild(this.toElement(dom));
      return dom;
    } catch (ParserConfigurationException e) {
    }
    return null;
  }

  public final Element toElement(Document dom) {
    Element ele = NodeType.condition.create(dom);
    boolean brif = (ele.getNodeName().equals(Condition.NodeType.condition.Ab));
    setNodeAttribute(ele, brif ? "n" : "not", brif ? (this.not ? "1" : "0") : this.not + "");
    setNodeAttribute(ele, brif ? "c" : "connectAs",
        brif ? this.connector.Ab() : this.connector.name());
    for (ICompare comp : this) {
      ele.appendChild(comp.toElement(dom));
    }
    return ele;
  }

  // 为一个节点设置一个属性
  public static final void setNodeAttribute(Element element, String name, String value) {
    Attr attr = element.getAttributeNode(name);
    if (attr == null) {
      attr = element.getOwnerDocument().createAttribute(name);
      element.setAttributeNode(attr);
    }
    attr.setValue(value);
  }

  public Condition(Document dom) {
    try {
      Element ele = (Element) dom.getElementsByTagName(Condition.NodeType.condition.Ab).item(0);
      if (ele == null)
        ele = (Element) dom.getElementsByTagName(Condition.NodeType.condition.name()).item(0);
      if (ele == null)
        return;
      this.initFromCondition(ele);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public Condition(Element element) {
    this.initFromCondition(element);
  }

  private void initFromCondition(Element element) {
    if (element == null)
      return;
    NamedNodeMap map = element.getAttributes();
    if ((element.getNodeName().equals(Condition.NodeType.condition.Ab))) {
      if ("1".equals(getNodeAttribute(map, "n")))
        this.not = true;
      if (!this.connector.Ab().equals(getNodeAttribute(map, "c")))
        this.connector = Connector.or;
    } else {
      if ("true".equals(getNodeAttribute(map, "not")))
        this.not = true;
      if (!this.connector.name().equals(getNodeAttribute(map, "connectAs")))
        this.connector = Connector.or;
    }
    NodeList nlist = element.getChildNodes();
    for (int i = 0, stop = nlist.getLength(); i < stop; i++) {
      Element n = (Element) nlist.item(i);
      NodeType ntyp = NodeType.typeOf(n.getNodeName());
      if (ntyp == null)
        continue;
      switch (ntyp) {
        case condition:
          this.add(new Condition(n));
          break;
        case compare:
          this.add(new Compare(n));
          break;
        default:
          continue;
      }
    }
  }

  final static String getNodeAttribute(NamedNodeMap map, String attr) {
    String value = null;
    try {
      Node node = map.getNamedItem(attr);
      if (node != null)
        value = node.getNodeValue();
    } catch (Exception e) {
    }
    return value;
  }

  // edit jinwei 20110310 处理错误的拼接
  public String toString() {
    StringBuffer buffer = new StringBuffer();
    if (this.not)
      buffer.append(" NOT ");
    buffer.append('(');
    // buffer.append('\n');
    // for(ICompare comp: this){
    for (int i = 0; i < this.size(); i++) {// edit jinwei 20110311
      // if(buffer==null){
      // buffer = new StringBuffer();
      //
      // }else{
      // buffer.append(' ');
      // if(null == this.get(i).getConnector()){
      // buffer.append(this.get(i-1).getConnector().name().toUpperCase());
      // }else{
      // buffer.append(this.get(i).getConnector().name().toUpperCase());
      // }
      // buffer.append(' ');
      // }
      // ---------niuhe 20110918 修改值为NULL的数据不能正确查询的BUG begin----------
      // buffer.append(this.get(i).toString());
      ICompare compare = this.get(i);
      String cmpType = compare.getType();
      String cmpField = compare.getA();
      String cmpValue = compare.getB();

      if (Compare.TYPE.equal.toString().equals(cmpType)
          || Compare.TYPE.like.toString().equals(cmpType)) {
        if ("".equals(cmpValue.trim())) {
          buffer.append("(");
          buffer.append(this.get(i).toString());
          buffer.append(" OR " + cmpField + " IS NULL ");
          buffer.append(")");
        } else {
          // shimiao 20140806 修改bug234 ^?(0([.]([0-9]+))?)$
          if (cmpValue.matches("^(\\d+\\.)?\\d+$")) {// liqiubo 20140904
                                                     // 修改此正则表达式，否则无法认识全部浮点类型，只认识以0开头的浮点数
            buffer.append("(");
            buffer.append(this.get(i).toString());
            buffer.append(" OR " + cmpField + " = " + cmpValue + " ");
            buffer.append(")");
          } else {
            buffer.append(this.get(i).toString());
          }
        }
      } else if (Compare.TYPE.notEqual.toString().equals(cmpType)
          || Compare.TYPE.notLike.toString().equals(cmpType)) {
        buffer.append("(");
        buffer.append(this.get(i).toString());
        if ("".equals(cmpValue.trim())) {
          buffer.append(" AND " + cmpField + " IS NOT NULL ");
        } else {
          buffer.append(" OR " + cmpField + " IS NULL ");
        }
        buffer.append(")");
      } else if (Compare.TYPE.knull.toString().equals(cmpType)) {
        buffer.append(cmpField + " IS NULL ");

      } else {
        buffer.append(this.get(i).toString());
      }
      // ---------niuhe 20110918 修改值为NULL的数据不能正确查询的BUG end----------
      if (i != (this.size() - 1)) {
        if (null != this.get(i).getConnector()) {
          // buffer.append("\n") ;
          buffer.append(" ");
          buffer.append(this.get(i).getConnector().name().toUpperCase());
          buffer.append(" ");
        }
      }
      // buffer.append('\n');
    }
    if (buffer != null) {
      buffer.append(')');
    }

    return buffer.toString();
  }

  public String toString(String tableTag) {
    if (StringUtils.isEmpty(tableTag)) {
      return toString();
    }
    StringBuffer buffer = new StringBuffer();
    if (this.not)
      buffer.append(" NOT ");
    buffer.append('(');
    // buffer.append('\n');
    // for(ICompare comp: this){
    for (int i = 0; i < this.size(); i++) {// edit jinwei 20110311
      // if(buffer==null){
      // buffer = new StringBuffer();
      //
      // }else{
      // buffer.append(' ');
      // if(null == this.get(i).getConnector()){
      // buffer.append(this.get(i-1).getConnector().name().toUpperCase());
      // }else{
      // buffer.append(this.get(i).getConnector().name().toUpperCase());
      // }
      // buffer.append(' ');
      // }
      // ---------niuhe 20110918 修改值为NULL的数据不能正确查询的BUG begin----------
      // buffer.append(this.get(i).toString());
      ICompare compare = this.get(i);
      String cmpType = compare.getType();
      String cmpField = tableTag + "." + compare.getA();
      String cmpValue = compare.getB();

      if (Compare.TYPE.equal.toString().equals(cmpType)
          || Compare.TYPE.like.toString().equals(cmpType)) {
        if ("".equals(cmpValue.trim())) {
          buffer.append("(");
          buffer.append(this.get(i).toString());
          buffer.append(" OR " + cmpField + " IS NULL ");
          buffer.append(")");
        } else {
          // shimiao 20140806 修改bug234 ^?(0([.]([0-9]+))?)$
          if (cmpValue.matches("^(\\d+\\.)?\\d+$")) {// liqiubo 20140904
                                                     // 修改此正则表达式，否则无法认识全部浮点类型，只认识以0开头的浮点数
            buffer.append("(");
            buffer.append(tableTag + "." +this.get(i).toString());
            buffer.append(" OR " + cmpField + " = " + cmpValue + " ");
            buffer.append(")");
          } else {
            buffer.append(tableTag + "." +this.get(i).toString());
          }
        }
      } else if (Compare.TYPE.notEqual.toString().equals(cmpType)
          || Compare.TYPE.notLike.toString().equals(cmpType)) {
        buffer.append("(");
        buffer.append(tableTag + "." +this.get(i).toString());
        if ("".equals(cmpValue.trim())) {
          buffer.append(" AND " + cmpField + " IS NOT NULL ");
        } else {
          buffer.append(" OR " + cmpField + " IS NULL ");
        }
        buffer.append(")");
      } else if (Compare.TYPE.knull.toString().equals(cmpType)) {
        buffer.append(cmpField + " IS NULL ");

      } else {
        buffer.append(tableTag + "." +this.get(i).toString());
      }
      // ---------niuhe 20110918 修改值为NULL的数据不能正确查询的BUG end----------
      if (i != (this.size() - 1)) {
        if (null != this.get(i).getConnector()) {
          // buffer.append("\n") ;
          buffer.append(" ");
          buffer.append(tableTag + "." +this.get(i).getConnector().name().toUpperCase());
          buffer.append(" ");
        }
      }
      // buffer.append('\n');
    }
    if (buffer != null) {
      buffer.append(')');
    }

    return buffer.toString();
  }

  /**
   * @author huying
   *         重载toString方法，此方法返回的条件不是为了查询数据而是用于档案著录中记住查询条件之后还能还原用户的查询条件，而不是被我们修饰过的条件，如果经过我们修饰之后将不能还原
   * @return
   */
  public String toOriginalString() {
    StringBuffer buffer = new StringBuffer();
    if (this.not)
      buffer.append(" NOT ");
    buffer.append('(');
    buffer.append('\n');
    // for(ICompare comp: this){
    for (int i = 0; i < this.size(); i++) {// edit jinwei 20110311
      // if(buffer==null){
      // buffer = new StringBuffer();
      //
      // }else{
      // buffer.append(' ');
      // if(null == this.get(i).getConnector()){
      // buffer.append(this.get(i-1).getConnector().name().toUpperCase());
      // }else{
      // buffer.append(this.get(i).getConnector().name().toUpperCase());
      // }
      // buffer.append(' ');
      // }
      // ---------niuhe 20110918 修改值为NULL的数据不能正确查询的BUG begin----------
      // buffer.append(this.get(i).toString());
      buffer.append(this.get(i).toString());
      // ---------niuhe 20110918 修改值为NULL的数据不能正确查询的BUG end----------
      if (i != (this.size() - 1)) {
        if (null != this.get(i).getConnector()) {
          buffer.append("\n");
          buffer.append(" ");
          buffer.append(this.get(i).getConnector().name().toUpperCase());
          buffer.append(" ");
        }
      }
      buffer.append('\n');
    }
    if (buffer != null) {
      buffer.append(')');
    }

    return buffer.toString();
  }

  /**
   * 得到不带换行符号的String,用于页面显示 huangheng 2009011 edit jinwei 20110310 处理错误的拼接
   * 
   * @return
   */
  public String toHtmlString() {
    StringBuffer buffer = new StringBuffer();
    if (this.not)
      buffer.append(" NOT ");
    buffer.append('(');
    // buffer.append('\n');
    // for(ICompare comp: this){
    for (int i = 0; i < this.size(); i++) {
      // if(buffer==null){
      // buffer = new StringBuffer();
      // if(this.not) buffer.append(" NOT ");
      // buffer.append('(');
      // }else{
      // buffer.append(' ');
      // if(null == this.get(i).getConnector()){
      // buffer.append(this.get(i-1).getConnector().name().toUpperCase()) ;
      // }else{
      // buffer.append(this.get(i).getConnector().name().toUpperCase());
      // }
      // buffer.append(' ');
      // }
      buffer.append(this.get(i).toString());
      if (i != (this.size() - 1)) {
        if (null != this.get(i).getConnector()) {
          buffer.append(" ");
          buffer.append(this.get(i).getConnector().name().toUpperCase());
          buffer.append(" ");
        }
      }
    }
    if (buffer != null) {
      buffer.append(')');
    }
    return buffer.toString();
  }

  /**
   * 得到sql条件,用于查询 ninglong20100322
   * 
   * @return
   */
  public String toSQLString() {
    // huying 20110623 修复拼接条件时的bug liukaiyuan 修复中括号无法检索的问题
    return this.isEmpty() ? null : (toString().replaceAll("\\-\\$", "").replaceAll("\\$\\-", "")
        .replaceAll("\"", "'"));
    // StringBuffer buffer = null;
    // for(ICompare comp: this){
    // if(buffer==null){
    // buffer = new StringBuffer();
    // if(this.not) buffer.append(" NOT ");
    // }else{
    // buffer.append(' ');
    // buffer.append(comp.getConnector().name().toUpperCase());
    // buffer.append(' ');
    // }
    // String comps = comp.toString().replace("[", "").replace("]", "").replace("\"", "'");
    // // String comps = comp.toString().replace("[", "").replace("]", "").replace("\"", "");
    // buffer.append(comps);
    // }
    // if(buffer==null)return "null";
    // return buffer.toString();
  }

  public String toSQLString(String tableTag) {
    return this.isEmpty() ? null : (toString(tableTag).replaceAll("\\-\\$", "").replaceAll(
        "\\$\\-", "").replaceAll("\"", "'"));
  }

  /**
   * 得到sql条件,用于档案信息订阅处的特殊字符（%，'，_）的条件转义 将Action中组装的含有特殊字符处理的条件转换为SQL字符串 xiaoxiong 20100525
   * 
   * @return
   */
  public String toHasSpecialCharactersSQLString() {
    // huying 20110914 修复为信息订阅拼接条件的bug，改成合toString方法一样的逻辑
    StringBuffer buffer = new StringBuffer();
    if (this.not)
      buffer.append(" NOT ");
    int i = 0;
    for (ICompare comp : this) {
      if (comp.toString().indexOf("escape") != -1) {
        String comps = comp.toString().replace("[", "").replace("]", "").replace("\"", "");
        comps =
            comps.replaceAll("!【", "[").replaceAll("!】", "]").replaceAll("!（", "(")
                .replaceAll("!）", ")");
        buffer.append(comps);
      } else {
        String comps = comp.toString().replace("[", "").replace("]", "").replace("\"", "'");
        comps =
            comps.replaceAll("!【", "[").replaceAll("!】", "]").replaceAll("!（", "(")
                .replaceAll("!）", ")");
        buffer.append(comps);
      }
      buffer.append(' ');
      if (i != (this.size() - 1)) {
        if (null != comp.getConnector()) {
          buffer.append(" ");
          buffer.append(comp.getConnector().name().toUpperCase());
          buffer.append(" ");
        }
      }
      buffer.append(' ');
      i++;
    }
    return buffer.toString();
  }

  // zhangwenbin 20110222 为利用统计服务
  public String getA() {
    return null;
  }

  public String getB() {
    return null;
  }

  public String getType() {
    return null;
  }

  // zhangwenbin 2011022 end

  /**
   * 根据条件String[] 获取条件
   */
  public static final Condition getCondition(String[] conditions) {
    Condition cond = new Condition();
    if (null != conditions && conditions.length > 0) {
      for (String condValue : conditions) {
        if (condValue.equals("")) {
          continue;
        }
        String[] condValues = condValue.split(",");
        List<String> condValueList = new ArrayList<String>();
        for (String value : condValues) {
          condValueList.add(value);
        }
        Compare c =
            new Compare(new Field(condValueList.get(0)),
                Compare.TYPE.valueOf(condValueList.get(1)), new ValueText(condValueList.get(2)));
        if (c.type.equals(Compare.TYPE.like)) {
          c.setRight(new ValueText("%" + condValueList.get(2) + "%"));
        }
        if (c.type.equals(Compare.TYPE.notLike)) {
          c.setRight(new ValueText("%" + condValueList.get(2) + "%"));
        }
        c.setAnd(Boolean.parseBoolean(condValueList.get(3)));
        cond.add(c);
      }
    }
    return cond;
  }

  /**
   * @see 根据页面传回的条件列表，生成sql
   * @author liukaiyuan 20121009
   * @param condition
   * @param columns
   * @return
   */
  public static final String getConditionString(List<String> condition, List<String> columns) {
    String conditionStr = null;
    if (null != condition && !condition.isEmpty()) {
      Condition cond = new Condition();
      for (String condValue : condition) {
        String[] condValues = condValue.split(",");
        List<String> condValueList = new ArrayList<String>();
        for (String value : condValues) {
          condValueList.add(value);
        }
        Compare c =
            new Compare(new Field(condValueList.get(0)),
                Compare.TYPE.valueOf(condValueList.get(1)), new ValueText(condValueList.get(2)));
        if (c.type.equals(Compare.TYPE.like)) {
          c.setRight(new ValueText("%" + condValueList.get(2) + "%"));
        }
        if (c.type.equals(Compare.TYPE.notLike)) {
          c.setRight(new ValueText("%" + condValueList.get(2) + "%"));
        }
        c.setAnd(Boolean.parseBoolean(condValueList.get(3)));
        cond.add(c);
      }
      if (!cond.isEmpty()) {
        conditionStr = cond.toSQLString();
      }
    }
    return conditionStr;
  }

  /**
   * @see 根据页面传回的条件列表,生成condition
   * @author liukaiyuan 20121009 修改：处理传递的字段值特殊符号（如逗号在此会混乱） zhanglei 20130528
   * @param condition
   * @param columns
   * @return
   */
  public static final Condition getConditionByList(List<String> condition) {
    Condition cond = new Condition();
    if (null != condition && !condition.isEmpty()) {
      for (String condValue : condition) {
        // String[] condValues = condValue.split(",");

        // 按第1个、第2个和最后1个逗号分隔
        String[] condValues = new String[4];
        int separator1 = condValue.indexOf(",");
        int separator3 = condValue.lastIndexOf(",");
        String field = condValue.substring(0, separator1);
        String relation = condValue.substring(separator3 + 1);
        String tempCond = condValue.substring(separator1 + 1, separator3);
        int newSeparator2 = tempCond.indexOf(",");
        String compare = tempCond.substring(0, newSeparator2);
        String text = tempCond.substring(newSeparator2 + 1);
        condValues[0] = field;
        condValues[1] = compare;
        condValues[2] = text;
        condValues[3] = relation;

        Compare c =
            new Compare(new Field(condValues[0]), Compare.TYPE.valueOf(condValues[1]),
                new ValueText(condValues[2]));
        if (c.type.equals(Compare.TYPE.like)) {
          c.setRight(new ValueText("%" + condValues[2] + "%"));
        }
        if (c.type.equals(Compare.TYPE.notLike)) {
          c.setRight(new ValueText("%" + condValues[2] + "%"));
        }
        c.setAnd(Boolean.parseBoolean(condValues[3]));
        cond.add(c);
      }
    }
    /** xiaoxiong 20140731 将没用的括号去掉 整体最外面只留一个小括号 **/
    if (!cond.isEmpty()) {
      cond = cond.simpleCondtion(cond);
    }
    return cond;
  }

  /*
   * public static void main(String[] s){ Condition cond = new Condition(); // Compute compute = new
   * Compute(Compute.TYPE.add); // compute.add(new Field("a.b.c")); // compute.add(new
   * ValueNumber(201)); // compute.add(new ValueNumber(133)); // cond.add(new Compare( // compute,
   * // Compare.TYPE.greaterThan, // new ValueNumber(1000) // )); // cond.add(new Compare( // new
   * Field("f.a.c"), // Compare.TYPE.like, // new ValueText("%text%") // ));
   * 
   * Compare c = new Compare( new Field("C1"), Compare.TYPE.equal, new ValueText("2010") ); //
   * c.setLeftBrackets(Compare.TYPE.leftBrackets.ab) ; c.setAnd(true) ; cond.add(c) ; // Compare c1
   * = new Compare( // new Field("档号"), // Compare.TYPE.equal, // new ValueText("333") // ); //
   * c1.setOr() ; // cond.add(c1) ; // Compare c2 = new Compare( // new Field("档号"), //
   * Compare.TYPE.equal, // new ValueText("222") // ); //
   * c1.setRightBrackets(Compare.TYPE.rightBrackets.ab) ; // cond.add(c2) ; //
   * System.out.println(cond); System.out.println(cond.toSQLString()); //// c1.setAnd() ; //
   * Document dom = cond.toDom() ; // String xml = DomUtil.convertToString(dom) ; //
   * System.out.println(xml) ; // Condition con = new Condition(dom) ; //
   * System.out.println(con.toHtmlString()); // Compare c2 = new Compare( ////
   * Compare.TYPE.leftBrackets.ab, // new Field("案卷号"), // Compare.TYPE.equal, // new ValueText("1")
   * //// Compare.TYPE.rightBrackets.ab // ); // c2.setLeftBrackets(Compare.TYPE.leftBrackets.ab) ;
   * // c2.setRightBrackets(Compare.TYPE.rightBrackets.ab) ; // c2.setOr() ; // cond.add(c2) ; //
   * Condition cond2 = new Condition() ; // cond2.setAnd() ; // cond.add(c1) ; // Condition cond2 =
   * new Condition().setOr(); // cond2.add(new Compare( // new ValueFloat(2.11), //
   * Compare.TYPE.greaterThan, // new Field("g.t.a") // ).setOr()); // cond2.add(new Compare( // new
   * Field("h.a"), // Compare.TYPE.notEqual, // new ValueDate("2005-1-1") // ).setOr()); //
   * cond2.add(new Compare( // new Field("h.a"), // Compare.TYPE.notEqual, // new
   * ValueDate("2005-1-1"))) ; // //System.out.println(cond2) ; // cond.add(cond2); //
   * System.out.println(DomUtil.convertToString(cond.toDom())); // Condition con = new
   * Condition(cond.toDom()) ; // System.out.println(DomUtil.convertToString(cond.toDom())) ; //
   * Condition cc = new Condition(cond.toDom()) ; // System.out.println(cc) ; //Document dom =
   * cond.toDom(); //System.out.println(RuleDomUtil.convertToString(dom)); //System.out.println();
   * //Condition cond3 = new Condition(dom); //Document dom3 = cond3.toDom();
   * //System.out.println(RuleDomUtil.convertToString(dom3));
   * 
   * }
   */

  // 测试用
  public static void main(String[] args) {
    String cmpValue = "355";
    System.out.println(cmpValue.matches("^(\\d+\\.)?\\d+$"));
  }

  /***
   * xiaoxiong 20140731 组装一个简单的Compare
   * 
   * @param condition
   * @return
   */
  public static Compare getCompare(String condition) {
    Compare c = null;
    if (!StringUtils.isEmpty(condition)) {
      String[] condValues = condition.split(",");
      List<String> condValueList = new ArrayList<String>();
      for (String value : condValues) {
        condValueList.add(value);
      }
      c =
          new Compare(new Field(condValueList.get(0)), Compare.TYPE.valueOf(condValueList.get(1)),
              new ValueText(condValueList.get(2)));
      if (c.type.equals(Compare.TYPE.like)) {
        c.setRight(new ValueText("%" + condValueList.get(2) + "%"));
      }
      if (c.type.equals(Compare.TYPE.notLike)) {
        c.setRight(new ValueText("%" + condValueList.get(2) + "%"));
      }
    }
    return c;
  }

  /***
   * xiaoxiong 20140731 将没用的括号去掉 整体最外面只留一个小括号
   * 
   * @param condition
   */
  public Condition simpleCondtion(Condition condition) {
    if (condition.size() == 1) {
      if (condition.get(0) instanceof Condition) {
        condition = (Condition) condition.get(0);
        condition = simpleCondtion(condition);
      }
    }
    return condition;
  }

  /****
   * xiaoxiong 20140731 标示当前条件是一个永远不成立的条件
   */
  public void setFalse() {
    this.isFalse = true;
  }

}
