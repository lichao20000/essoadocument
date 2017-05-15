package cn.flying.rest.service.utils;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
	/**
	 * 解析XML文件
	 * @author xufeng 20121017
	 *	
	 */


public class ParseDataXml{ 
	//获取根元素
	public static Element getRootElement(String url) {
			//首先创造一个DocumentBuilder对象，
			//可以从DocumentBuilderFactory中得到 
		try {
			DocumentBuilderFactory factory=DocumentBuilderFactory.newInstance(); 
			DocumentBuilder builder=factory.newDocumentBuilder();
			//现在可以从文件中读入一个文档    
			File f=new File(url);   
			Document doc=(Document) builder.parse(f);    
		//可以调用getDocumentElement方法来分析文档内容，他返回的是根元素    
			return doc.getDocumentElement();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		} 
	}
	public static Map<String,String> getPackageDescription(Element element){
		NodeList description = element.getFirstChild().getChildNodes();
		Map<String,String> map=new HashMap<String, String>();
		for(int i=0;i<description.getLength();i++){
			map.put(description.item(i).getNodeName(),description.item(i).getTextContent());
		}
		return map;
		
	}
	//将Package中的Description按照Level存放到List中
	public static Map<String,Map<String,String>> saveMap(Element element,int i){
		NodeList children=element.getChildNodes();
		Map<String,Map<String,String>> map=new HashMap<String, Map<String,String>>();
		Element package1=(Element) children.item(i);
		String level=package1.getAttribute("PackageLevel");
	//	Map<String,HashMap<String,String>> hh = Map<String,HashMap<String,String>>();
//		hh.put(level, map);
		Map<String,String> map1=addMap(element, i);
		map.put(level,map1);
		return map;
		
	}
	public static Map<String,String> addMap(Element element,int i){
		NodeList children=element.getChildNodes();
		Element package1=(Element) children.item(i);
		NodeList child=package1.getChildNodes().item(0).getChildNodes();
		 Map<String,String> map=new HashMap<String, String>();
		 for (int j = 0; j < child.getLength(); j++) {
			map.put(child.item(j).getNodeName(),child.item(j).getTextContent());
		}
		return map;
	}
	//循环获取根节点下Package元素
	public static Map<String,Map<String,String>> getElement(Element element){
		Map<String,Map<String,String>> map=new HashMap<String, Map<String,String>>();
		for (int i = 1; i <element.getChildNodes().getLength(); i++) {
			map=saveMap(element,i);
		}
		return map;
	}
	public static Element bool(Element element){
		NodeList children=element.getChildNodes();
		if(children.getLength()>1){
			for(int e=1;e < children.getLength();e++){
				element=(Element)children.item(e);
			}
		}
		return element;
	}
	//获取Package中Content元素
	public static Map<String,Map<String,String>> getContent(Element element){
		NodeList children=element.getChildNodes();
		Map<String,Map<String,String>> map=new HashMap<String, Map<String,String>>();
		if (children.getLength()>1) {
			element=bool(element);
			do{
				element=bool(element);
				if(element.getNodeName().equals("Content")) break;
				element=(Element) element.getChildNodes().item(0);
			}while(!element.getNodeName().equals("Content"));			
			for (int i = 0; i < element.getChildNodes().getLength(); i++) {				
				map = saveMap(element,i);	
			}	
		}
		return map;
	}
	public static List<Map> getAll(Element element){
		List<Map> list=new ArrayList<Map>();
		list.add(getPackageDescription(element));
		list.add(getElement(element));
		list.add(getContent(element));
		return list;
	}
	public static void main(String[] args) {
		String url="C:/Users/Administrator/Desktop/P_PMS0020120810010010088.xml";
		Element element = getRootElement(url);
		List<Map> list=getAll(element);
		System.out.println(list.toString());
//		List<Object> list = getPackageDescription(getRootElement(url));
//		System.out.println(list.toString());
	//	Element elm=getRootElement(url);
	//	System.out.println(elm.getChildNodes().item(1));
//		List<Object> list=getAll(getRootElement(url));
//		System.out.println(list.toString());
//		System.out.println(getPackageDescription(getRootElement(url)));
	}
}

		
