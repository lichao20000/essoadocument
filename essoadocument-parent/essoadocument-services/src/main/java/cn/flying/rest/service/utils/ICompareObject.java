package cn.flying.rest.service.utils;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public interface ICompareObject {
  public Compare.OBJECTTYPE typeOfCompareObject();

  public Element toElement(Document dom);
}
