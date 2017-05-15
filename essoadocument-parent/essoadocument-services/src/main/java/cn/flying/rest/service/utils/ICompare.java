package cn.flying.rest.service.utils;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * 本接口用于描述比较式和条件式（条件式为复杂的比较式） 本接口着重描述一个比较式与前一个比较式之间的关联关系 有两种：and / or 缺省应该为and
 * */
public interface ICompare {
  // 两种连结式
  public enum Connector {
    and("&"), or("|");
    private String ab = "";

    private Connector(String ab) {
      this.ab = ab;
    }

    public String Ab() {
      return this.ab;
    }
  }

  // 将比较设反
  public ICompare setNot();

  // 设置为并联
  public ICompare setAnd();

  // 设置为或者连结
  public ICompare setOr();

  // 动态设置
  public ICompare setAnd(boolean isAnd);

  // 返回比较类型
  public Connector getConnector();

  // 生成DOM
  public Element toElement(Document dom);

  // zhangwenbin 20110222 为利用统计服务
  public String getA();

  public String getB();

  public String getType();
  // zhangwenbin 2011022 end
}
