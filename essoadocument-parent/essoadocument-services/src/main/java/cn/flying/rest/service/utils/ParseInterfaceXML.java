package cn.flying.rest.service.utils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.xpath.XPath;



/**
 * 数据格式：根结点：data，子节点：多个package，子节点的子：description、content(可包含多个package)  依次嵌套
 * @author jin 2007-04-05
 *
 */
public class ParseInterfaceXML {
	//constructor
	public ParseInterfaceXML(){}

	//读取根结点
	public HashMap<String,HashMap<String,HashMap<String,String>>> parseRoot(File file){
		HashMap<String,HashMap<String,HashMap<String,String>>> paseData = new HashMap<String,HashMap<String,HashMap<String,String>>>() ;
		List<HashMap<String,String>> attributes = new ArrayList<HashMap<String,String>>() ;
		try {
				SAXBuilder saxBuilder = new SAXBuilder() ;
				Document doc = saxBuilder.build(file) ;
				Element root = doc.getRootElement() ;
				//读取根结点的属性
				HashMap<String,String> dm = new HashMap<String,String>() ;
				List elements = root.getAttributes() ;
//				Iterator it = elements.iterator() ;
//				while(it.hasNext()){
//					dm = new HashMap<String,String>() ;
//					Attribute a = (Attribute) it.next() ;
//					dm.put(a.getName(),a.getValue()) ;
//					attributes.add(dm) ;
//				}
				//根结点下是否含有Package节点
				if(root.getChildren().size()>0){
					//读取根结点的所有子节点(即Package节点)
//					List rootChildList = XPath.selectNodes(root,"PackageDescription") ;
					List rootChildList = root.getChildren();
					for(int i = 0; i<rootChildList.size(); i++){
						//读取其中一个根结点的子节点(即 Package节点)
						Element packageElement = (Element) rootChildList.get(i) ;
						if(packageElement.getName()=="PackageDescription"){
							//处理包内容
							List packageDescList = packageElement.getChildren();
							for(int k = 0; k < packageDescList.size();k++){
								Element ele = (Element) packageDescList.get(k);
								if (ele.getName().equals("FileChecksum")) {
								String include = ele.getText();
								include = include.toLowerCase();
								dm.put(ele.getName(),include);
								}
								else{
								dm.put(ele.getName(),ele.getText());
								}
							}
						} else {
							
							dm.putAll(parsePackage(packageElement,"Description"));
							HashMap<String,HashMap<String,String>> recordHm = new HashMap<String,HashMap<String,String>>();
							recordHm.put(dm.get("Title"), dm);
							paseData.put("record", recordHm);
							
							//处理content
							Element filePackageList = (Element)packageElement.getChildren().get(1);
							List childList = filePackageList.getChildren();
							HashMap<String,HashMap<String,String>> contentHm = new HashMap<String,HashMap<String,String>>();
							for(int j=0;j<childList.size();j++){
							 HashMap<String,String> hm = new HashMap<String,String>();
							 
							 hm = parsePackage((Element)childList.get(j),"Description");
							 contentHm.put(hm.get("FileChecksum"), hm);
							}
							
							paseData.put("file", contentHm);
						}
						//huangheng 20080225 edit setLevel
//						parsePackage(packageElement,0) ;
					}
					
				}
		} catch (JDOMException e) {
			// TODO 自动生成 catch 块
			e.printStackTrace();
		} catch (IOException e) {
			// TODO 自动生成 catch 块
			e.printStackTrace();
		}
		
		return paseData ;
	}
	

	
	private HashMap<String,String> parsePackage(Element pkgElement,String flag){
		List childrenList = pkgElement.getChildren();
		HashMap<String,String> hm = new HashMap<String,String>();
		for(int i = 0; i<childrenList.size();i++){
			Element ele = (Element) childrenList.get(i);
			if(ele.getName()=="Description"){
				List list = ele.getChildren();
				for(int k=0; k < list.size();k++){
					Element element = (Element) list.get(k);
					hm.put(element.getName(), element.getText());
				}
				return hm;
			} else {
					List list = ele.getChildren();
					for(int k=0; k < list.size();k++){
						Element element = (Element) list.get(k);
						parsePackage(element,"Description");
					}
			}
			
		}
		return hm;
	}

	
	//读取根结点下的一个Package子节点
	private HashMap<String,String> parsePackage(Element pkgElement,int level){
		HashMap<String,String> hm = new HashMap<String,String>() ;
		try {
				//读取Package节点下的Description节点
				Element descriptionElement = (Element) XPath.selectSingleNode(pkgElement,"child::Description") ;
				//读取Description节点下的所有子节点
				List descriptionChildList = XPath.selectNodes(descriptionElement,"child::*") ;
				HashMap<String,String> desDataMap = new HashMap<String,String>() ;
				//遍历Description所有子节点
				for(int i = 0; i<descriptionChildList.size(); i++){
					//读取一个Description的子节点
					Element descriptionChildElement = (Element) descriptionChildList.get(i) ;
					//读取该节点的值
					String value = descriptionChildElement.getTextTrim() ;
					//将所有Description子节点的内容以键－值对应放入Map
					desDataMap.put(descriptionChildElement.getName(),value) ;
				}
				//是否含有Content节点
				if(pkgElement.getChildren().size()>0){
					//读取所有该Package节点下的Content节点
					List contentElementList = XPath.selectNodes(pkgElement,"child::Content") ;
					//遍历Package节点下的所有Content节点
					for(int j = 0; j<contentElementList.size(); j++){
						//读取一个Content节点
						Element contentElement = (Element) contentElementList.get(j) ;
						//递归给下面读取Content的方法
						parseContent(contentElement,level) ;
					}
				}
		} catch (JDOMException e) {
			// TODO 自动生成 catch 块
			e.printStackTrace();
		}
		return hm ;
	}
	
	//读取一个Content节点
	private HashMap<String,String> parseContent(Element contentElement,int level){
		//是否含有Package节点
		if(contentElement.getChildren().size()>0){
			try {
					//读取Content节点下的所有Package节点
					List contentChildList = XPath.selectNodes(contentElement,"child::Package") ;
					//遍历Content节点下的所有Package节点
					for(int i = 0; i<contentChildList.size(); i++){
						//读取一个Package节点
						Element contentChildPackage = (Element) contentChildList.get(i) ;
						//递归给上面读取Package的方法
						return parsePackage(contentChildPackage,level) ;
					}
			} catch (JDOMException e) {
				e.printStackTrace();
			}
		}
		
		return null;
	}
	
	
	
	//main函数
		@SuppressWarnings("unchecked")
		public static void main(String[] args){
//			try{
//				SAXBuilder saxBuilder = new SAXBuilder() ;
//				Document doc = saxBuilder.build(new File("d:/sip-data.xml")) ;
//				Element root = doc.getRootElement() ;
//				List rootChildList = XPath.selectNodes(root,"/data/*") ;
//				for(int i = 0; i<rootChildList.size(); i++){
//					//读取其中一个根结点的子节点(即 Package节点)
//					Element packageElement = (Element) rootChildList.get(i) ;
//					List list = XPath.selectNodes(packageElement, "child::Content") ;
//					Element contentEle = (Element)list.get(0);
//					List l = XPath.selectNodes(contentEle, "child::Package") ;
//					l.size();
//				}
//			}catch(Exception e){
//				e.printStackTrace() ;
//			}
			ParseInterfaceXML px = new ParseInterfaceXML() ;
			px.parseRoot(new File("")) ;
		}
}
