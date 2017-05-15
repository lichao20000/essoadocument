package cn.flying.rest.service.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

/**
 * 各模糊检索组装检索条件工具类
 * 
 * @author liuhuifang 20121129
 * 
 */
public class ParseConditionUtil {
	/**
	 * 无参构造器
	 * 
	 */
	public ParseConditionUtil() {

	}

	/**
	 * 缓存用户环境变量配置信息
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID
	 *            用户id
	 * @return 当前用户配置的配置的模糊检索类型
	 */
	public static String getAppConfigValueByKey(String userID) {
//		String value = (String) request.getSession().getAttribute(
//				"appConfigValue_KEYWORDRELATION");
//		if (value == null) {
//			HashMap<String, String> dataList = pkgserver.getDriver()
//					.getOperateServer().getAppConfigForUser()
//					.getAppConfigInfoByKey(userID, "KEYWORDRELATION");
//			value = dataList.get("value");
//			request.getSession().setAttribute("appConfigValue_KEYWORDRELATION",
//					value);
//		}
//		return value;
		return "AND" ;
	}

	/**
	 * 根据检索方式 组装检索条件(字段类型必须都为字符类型)
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID
	 *            当前用户id
	 * @param searchKeyword
	 *            检索词
	 * @param fields
	 *            参与检索字段
	 * @return 组装好的检索条件
	 */
//	public static String ParseCondition(HttpServletRequest request, PkgServer pkgserver, String userID, String searchKeyword, String[] fields){
//	//huangheng 20121204 add 增加空判断，如果为空直接返回null
//	if (null == searchKeyword || searchKeyword.length() == 0){
//		return null ;
//	}
//	String searchType = getAppConfigValueByKey(request,pkgserver,userID) ;
//	String[] keyWord = searchKeyword.split(" ");
//	 String condtion = "";
//	  for(int i=0;i<keyWord.length;i++){
//		  String fildcond = "";
//		  if(keyWord[i].equals("")) {
//				continue;
//			} else {
//				/** 检索词不为空，就组装检索字符串 */
//				for (int j = 0; j < fields.length; j++) {
//					/** 循环字段数组 */
//					if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
//						fildcond += fields[j] + " like '%" + keyWord[i]+ "%'  ESCAPE '!' or ";
//					} else {
//						fildcond += fields[j] + " like '%" + keyWord[i]+ "%' or ";
//					}
//				}
//				fildcond = fildcond.substring(0, fildcond.length()-4)+") " + searchType;
//			}
//			condtion += fildcond;
//		}
//		condtion = "("+condtion.substring(0, condtion.length()-3)+")";
//		return condtion;
//	}
	
	/**
	 * fuzhilin 20121204 根据检索方式 组装检索条件
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID 当前用户id
	 * @param searchKeyword 检索词
	 * @param dataMap 参与检索字段值
	 * @return 组装好的检索条件
	 */
	public static List<Map> ParseCondition(String userID, String searchKeyword, List<Map> dataMap) {
			if (null == searchKeyword || searchKeyword.length() == 0) {
				return null;
			}
			//jiangyuntao 20130129 edit 增加去前后空格，避免报错！
			searchKeyword = searchKeyword.trim();
			String searchType = getAppConfigValueByKey(userID);
			String[] keyWord = searchKeyword.split(" ");
			List<Map> list = new ArrayList<Map>() ;
			for(Map m:dataMap){
				boolean flag=false;
				for(String key:keyWord){
					if (key.equals("")) {
						continue;
					}else{
						if(searchType.trim().equals("OR")){
							Iterator iterator = m.keySet().iterator();
							while(iterator.hasNext()) {
								if(m.get(iterator.next()).toString().trim().indexOf(key)!=-1){
									flag=true;
									break;	
								} 
							}
							if(flag){
								break;
							}
						}else{
							Iterator iterator = m.keySet().iterator();
							while(iterator.hasNext()) {
								if(m.get(iterator.next()).toString().trim().indexOf(key)!=-1){
									flag=true;
									break;	
								}else{
									flag=false;
								}
							}
							if(!flag){
								break;
							}
						}
					}
				}
				if(flag){
					list.add(m);
				}
			}
			return list;
		
	}
	
	/**
	 * fuzhilin 20121204 根据检索方式 组装检索条件
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID 当前用户id
	 * @param searchKeyword 检索词
	 * @param dataMap 所有的字段值
	 * @param fields 参与检索字段值
	 * @return 组装好的检索条件
	 */   
	public static List<Map> ParseCondition(String userID, String searchKeyword, List<Map> dataMap, String[]fields) {  
			if (null == searchKeyword || searchKeyword.length() == 0) {
				return null;
			}
			//jiangyuntao 20130129 edit 增加去前后空格，避免报错！
			searchKeyword = searchKeyword.trim();
			StringBuffer sb = new StringBuffer();
			for(int i = 0; i < fields.length; i++){
				sb. append(fields[i]);
			}
			String searchType = getAppConfigValueByKey(userID);
			String[] keyWord = searchKeyword.split(" ");
			List<Map> list = new ArrayList<Map>() ;
			for(Map m : dataMap){
				boolean flag=false;
				for(String key:keyWord){
					if (key.equals("")) {
						continue;
					}else{
						if(searchType.trim().equals("OR")){
							Iterator iterator = m.entrySet().iterator();
							while(iterator.hasNext()) {
								java.util.Map.Entry entry = (java.util.Map.Entry)iterator.next();
								if(sb.toString().indexOf(entry.getKey().toString().trim())==-1){
									continue;
								}
								if(entry.getValue().toString().trim().indexOf(key)!=-1){
									flag=true;
									break;	
								} 
							}
							if(flag){
								break;
							}
						}else{
							Iterator iterator = m.entrySet().iterator();
							while(iterator.hasNext()) {  
								java.util.Map.Entry entry = (java.util.Map.Entry)iterator.next();
								if(sb.toString().indexOf(entry.getKey().toString().trim())==-1){
									continue;
								}
								/** niuhe 20130608 添加特殊字符支持-HTML特殊字符转义 **/
								if(entry.getValue().toString().trim().indexOf(key)!=-1){
									flag=true;
									break;	
								}else{
									flag=false;
								}
							}
							if(!flag){
								break;
							}
						}
					}
				}
				if(flag){
					list.add(m);
				}
			}
			return list;
		
	}
	
	/**
	 * 根据检索方式 组装检索条件(字段类型必须都为字符类型)
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID
	 *            当前用户id
	 * @param searchKeyword
	 *            检索词
	 * @param fields
	 *            参与检索字段
	 * @return 组装好的检索条件
	 */
	public static String ParseCondition(String userID, String searchKeyword, String[] fields){
		/** chenzhenhai 20121221 添加关键词为空的判断 **/
		if (null == searchKeyword || searchKeyword.length() == 0) {
			return null;
		}
		//jiangyuntao 20130129 edit 增加去前后空格，避免报错！
		searchKeyword = searchKeyword.trim();
		/****zhouwenhai 20130311 如果检索词中含有%或_就用!%和!_进行替换.(6854) begin*********/
		/**chenjian 20130326 防止用户输入!检索异常*/
		searchKeyword = searchKeyword.replaceAll("!", "!!").replaceAll("%", "!%").replaceAll("_", "!_");
		/** niuhe 20130529 添加特殊字符支持-单引号 **/
		searchKeyword = searchKeyword.replaceAll("'", "''");
		/****zhouwenhai 20130311 end***************************/
		String condtion = "";
		/** chenzhenhai 20121206 关键字为null或去除空格后为空字符串都不参检索,返回条件为空字符串 **/
		if (null != searchKeyword && !"".equals(searchKeyword.trim())){
			String searchType = getAppConfigValueByKey(userID) ;
			/** 以空格为拆分符对关键词进行拆分 **/
			String[] keyWord = searchKeyword.split(" ");
			/** 如果传来的字段列表为空,不需要再组装条件 **/
			if(fields.length>0){
				StringBuffer fildcond = new StringBuffer();
				int keyWordLenhth = keyWord.length ;
				/** 如果为多个关键字时将整个条件用"()"括起来 **/
				if(keyWordLenhth>1){
					fildcond.append("(");
				}
				for(int i=0; i < keyWordLenhth; i++){
				if(keyWord[i].equals("")) {
					continue;
				} else {
					/** 如果关键词可拆分成两个或两个以上的关键字,则在进入第二个循环时添加上“环境变量”中设置的关系符 **/
					if(i>0){
						fildcond.append(" ").append(searchType).append(" ") ;
					}
					fildcond.append("(");
					for (int j = 0; j < fields.length; j++) {
						if(j==0){
							if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
								fildcond.append(fields[j] + " like '%" + keyWord[i]+ "%'  ESCAPE '!'") ;
							} else {
								fildcond.append(fields[j] + " like '%" + keyWord[i]+ "%'") ;
							}

						}else{
							if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
								fildcond.append(" OR ").append(fields[j] + " like '%" + keyWord[i]+ "%'  ESCAPE '!'") ;
							} else {
								fildcond.append(" OR ").append(fields[j] + " like '%" + keyWord[i]+ "%'") ;
							}
						}
					}
				}
					fildcond.append(")") ;
				}
				/** 如果为多个关键字时将整个条件用"()"括起来 **/
				if(keyWordLenhth>1){
					fildcond.append(")") ;
				}
				condtion = fildcond.toString();
			}
		}
		return condtion;
	}

	/**
	 * 根据检索方式 组装检索条件(字段类型必须都为字符类型)
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID
	 *            当前用户id
	 * @param searchKeyword  
	 *            检索词
	 * @param fields
	 *            参与检索字段
	 * @param contrast <String, Pair<String, String>><字段名称<页面显示数据，数据库存储数据>>
	 *            数据存的数据与页面显示数据
	 * @return 组装好的检索条件
	 */
	public static String ParseCondition(String userID, String searchKeyword,
			String[] fields, HashMap<String, HashMap<String, String>> contrast) {   
		// huangheng 20121204 add 增加空判断，如果为空直接返回null
		if (null == searchKeyword || searchKeyword.length() == 0) {
			return null;
		}
		//jiangyuntao 20130129 edit 增加去前后空格，避免报错！
		searchKeyword = searchKeyword.trim();
		String searchType = getAppConfigValueByKey(userID);
		/**chenjian 20130326 防止用户输入!检索异常*/
		searchKeyword = searchKeyword.replaceAll("!", "!!").replaceAll("%", "!%").replaceAll("_", "!_");
		/** niuhe 20130529 添加特殊字符支持-单引号 **/
		searchKeyword = searchKeyword.replaceAll("'", "''");
		String[] keyWord = searchKeyword.split(" ");
		String condtion = "";
		List<String> field = new ArrayList<String>();
		for (int j = 0; j < fields.length; j++) {
			if(!contrast.containsKey(fields[j])){
				field.add(fields[j]);
			}
		}
		for (int i = 0; i < keyWord.length; i++) {
			String fildcond = "(";
			if (keyWord[i].equals("")) {
				continue;
			}else {
				String fac = ParseCondition(contrast,keyWord[i]);
				if(fac.length()>0){
					fildcond += fac ;
				}
				for (String f:field) {
					if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
						fildcond += f+ " like '%" + keyWord[i] + "%'  ESCAPE '!' or ";
					} else {
						fildcond += f + " like '%" + keyWord[i] + "%' or ";
					}
				}
				fildcond = fildcond.substring(0, fildcond.length() - 4) + ") " + searchType;
			}
			condtion += fildcond;
		}
		condtion = "("+condtion.substring(0, condtion.length() - 3)+")";
		return condtion;
	}
	/**
	 * zhengfang 20130720 (暂时只有结构模版定义的检索用到)
	 * 根据检索方式 组装检索条件(字段类型必须都为字符类型)
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID  当前用户id
	 * @param searchKeyword 检索词
	 * @param contrast &lt;字段名称,&lt;页面显示数据,数据库存储数据&gt;&gt;  数据存的数据与页面显示数据
	 *           
	 * @return 组装好的检索条件
	 */
	public static String ParseSearchCondition(String userID, String searchKeyword,
            HashMap<String, HashMap<String, String>> contrast) {   
		if (null == searchKeyword || searchKeyword.length() == 0) {
			return null;
		}
		searchKeyword = searchKeyword.trim();
		String searchType = getAppConfigValueByKey(userID);
		/**防止用户输入!检索异常*/
		searchKeyword = searchKeyword.replaceAll("!", "!!").replaceAll("%", "!%").replaceAll("_", "!_");
		/**添加特殊字符支持-单引号 **/
		searchKeyword = searchKeyword.replaceAll("'", "''");
		String[] keyWord = searchKeyword.split(" ");
		Set<String> searchFields = contrast.keySet();
		String condtion = "";
		for (int i = 0; i < keyWord.length; i++) {
			String fildcond = "(";
			if (keyWord[i].equals("")) {
				continue;
			}else {
				String fac = ParseCondition(contrast,keyWord[i]);
				if(fac.length()>0){
					fildcond += fac ;
				}
				
				for (String f:searchFields) {
					if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
						fildcond += f+ " like '%" + keyWord[i] + "%'  ESCAPE '!' or ";
					} else {
						fildcond += f + " like '%" + keyWord[i] + "%' or ";
					}
				}
				fildcond = fildcond.substring(0, fildcond.length() - 4) + ") " + searchType;
			}
			condtion += fildcond;   
		}
		condtion = "("+condtion.substring(0, condtion.length() - 3)+")";
		return condtion;
	}
	/**
	 * 处理页面显示数据与数据库存储数据部一致组装检索条件
	 * @param contrast <字段名称<页面显示数据，数据库存储数据>>
	 * @param keyWord  检索词
	 * @return  字段名称和组装的检索条件
	 */
	private static String ParseCondition(
			HashMap<String, HashMap<String, String>> contrast, String keyWord) {
		StringBuffer sb = new StringBuffer() ; 
		for (Entry<String, HashMap<String,String>> entry : contrast.entrySet()) {
			String field = entry.getKey();
			HashMap<String,String> Value = entry.getValue(); 
			for(Entry<String, String> v:Value.entrySet()){
				String showValue = v.getKey();
				String saveValue = v.getValue();
				if (showValue.contains(keyWord)) {
					sb.append(field).append(" = '").append(saveValue).append("' or ") ;
				}
			}
		}
		return sb.toString();
	}

	/**
	 * 根据检索方式 组装检索条件(页面显示内容与数据库存储内容不一致的)
	 * 
	 * @param request
	 * @param pkgserver
	 * @param userID
	 *            当前用户id
	 * @param searchKeyword
	 *            检索词
	 * @param fields
	 *            参与检索字段
	 * @param fieldsAndType
	 *            检索字段类型和字段(字段类型处理了NUMBER,FLOAT,DATE,字符)fieldsAndType.put(
	 *            "ID","NUMBER");
	 * @return 组装好的检索条件
	 */
	public static String ParseCondition(String userID, String searchKeyword,
			HashMap<String, String> fieldsAndType) {
		if (null == searchKeyword || searchKeyword.length() == 0) {
			return null;
		}
		//jiangyuntao 20130129 edit 增加去前后空格，避免报错！
		searchKeyword = searchKeyword.trim();
		
		String searchType = getAppConfigValueByKey(userID);
		/**chenjian 20130326 防止用户输入!检索异常*/
		searchKeyword = searchKeyword.replaceAll("!", "!!").replaceAll("%", "!%").replaceAll("_", "!_");
		/** niuhe 20130529 添加特殊字符支持-单引号 **/
		searchKeyword = searchKeyword.replaceAll("'", "''");
		String[] keyWord = searchKeyword.split(" ");
		String condtion = "";
		for (int i = 0; i < keyWord.length; i++) {
			String fildcond = " (";
			if (keyWord[i].equals("")) {
				continue;
			} else {
				for (Entry<String, String> entry : fieldsAndType.entrySet()) {
					if (entry.getValue().equals("NUMBER")|| entry.getValue().equals("FLOAT")) {
						fildcond += entry.getKey() + " = " + keyWord[i]+ " or ";
					} else if (entry.getValue().equals("DATE")) {
						fildcond += "to_char(" + entry.getKey()+ ",'yyyy-mm-dd')" + " like '%" + keyWord[i]+ "%' or ";
					} else {
						if (keyWord[i].contains("!%")|| keyWord[i].contains("!_")) {
							fildcond += entry.getKey() + " like '%"+ keyWord[i] + "%'  ESCAPE '!' or ";
						} else {  
							fildcond += entry.getKey() + " like '%"+ keyWord[i] + "%' or ";
						}
					}
				}
				fildcond = fildcond.substring(0, fildcond.length() - 4) + ") "+ searchType;
			}
			condtion += fildcond;
		}
		condtion = condtion.substring(0, condtion.length() - 3);
		return condtion;
	}
	/**
	 * 根据检索方式 组装检索条件(字段类型必须都为字符类型) 
	 * songcaifeng 20121208 add
	 * 重载 增加参数ignoreCase：是否忽略大小写
	 * @param request
	 * @param pkgserver
	 * @param userID
	 *            当前用户id
	 * @param searchKeyword
	 *            检索词
	 * @param fields
	 *            参与检索字段
	 * @return 组装好的检索条件
	 */
	public static String ParseCondition(String userID, String searchKeyword, String[] fields,boolean ignoreCase){
		if (!ignoreCase){
			return ParseCondition(userID, searchKeyword, fields) ;
		}
		else{
			String condtion = "";
			/** chenzhenhai 20121206 关键字为null或去除空格后为空字符串都不参检索,返回条件为空字符串 **/
			if (null != searchKeyword && !"".equals(searchKeyword.trim())){
				//jiangyuntao 20130129 edit 增加去前后空格，避免报错！
				searchKeyword = searchKeyword.trim();
				String searchType = getAppConfigValueByKey(userID) ;
				/** 以空格为拆分符对关键词进行拆分 **/
				String[] keyWord = searchKeyword.split(" ");
				/** 如果传来的字段列表为空,不需要再组装条件 **/
				if(fields.length>0){
					StringBuffer fildcond = new StringBuffer();
					int keyWordLenhth = keyWord.length ;
					/** 如果为多个关键字时将整个条件用"()"括起来 **/
					if(keyWordLenhth>1){
						fildcond.append("(");
					}
					for(int i=0; i < keyWordLenhth; i++){
					if(keyWord[i].equals("")) {
						continue;
					} else {
						/** 如果关键词可拆分成两个或两个以上的关键字,则在进入第二个循环时添加上“环境变量”中设置的关系符 **/
						if(i>0){
							fildcond.append(" ").append(searchType).append(" ") ;
						}
						fildcond.append("(");
						for (int j = 0; j < fields.length; j++) {
							if(j==0){
								if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
									fildcond.append("UPPER(" + fields[j] + ")" + " like '%" + keyWord[i].toUpperCase()+ "%'  ESCAPE '!'") ;
								} else {
									fildcond.append("UPPER(" +  fields[j] + ")" + " like '%" + keyWord[i].toUpperCase()+ "%'") ;
								}
	
							}else{
								if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
									fildcond.append(" OR ").append("UPPER(" +  fields[j] + ")"  + " like '%" + keyWord[i].toUpperCase()+ "%'  ESCAPE '!'") ;
								} else {
									fildcond.append(" OR ").append("UPPER(" +  fields[j] + ")"  + " like '%" + keyWord[i].toUpperCase()+ "%'") ;
								}
							}
						}
					}
						fildcond.append(")") ;
					}
					/** 如果为多个关键字时将整个条件用"()"括起来 **/
					if(keyWordLenhth>1){
						fildcond.append(")") ;
					}
					condtion = fildcond.toString();
				}
			}
			return condtion;
		}
	}
	
	
	public static void main(String[] args) {
		
		String searchKeyword = "暂停    bb 启动          dd";
		String[] fields = {"JOB_NAME"};
		HashMap<String, HashMap<String, String>> contrast = new HashMap<String, HashMap<String, String>>();
		HashMap<String, String> value = new HashMap<String, String>();
		value.put("暂停", "PAUSED");
		value.put("启动", "WAITING");
		contrast.put("TRIGGER_STATE", value);
		String condtion = "";
		
		if (null != searchKeyword && !"".equals(searchKeyword.trim())){
			String searchType = "AND" ;
			/** 以空格为拆分符对关键词进行拆分 **/
			String[] keyWord = searchKeyword.split(" ");
			/** 如果传来的字段列表为空,不需要再组装条件 **/
			if(fields.length>0){
				StringBuffer fildcond = new StringBuffer();
				int keyWordLenhth = keyWord.length ;
				/** 如果为多个关键字时将整个条件用"()"括起来 **/
				if(keyWordLenhth>1){
					fildcond.append("(");
				}
				for(int i=0; i < keyWordLenhth; i++){
					/** 如果关键词可拆分成两个或两个以上的关键字,则在进入第二个循环时添加上“环境变量”中设置的关系符 **/
					
					  if(keyWord[i].equals("")) {
					continue;
				} else {
					if(i>0){
						fildcond.append(" ").append(searchType).append(" ") ;
					}
					fildcond.append("(");
					for (int j = 0; j < fields.length; j++) {
						if(j==0){
							if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
								fildcond.append(fields[j] + " like '%" + keyWord[i]+ "%'  ESCAPE '!'") ;
							} else {
								fildcond.append(fields[j] + " like '%" + keyWord[i]+ "%'") ;
							}

						}else{
							if (keyWord[i].contains("!%") || keyWord[i].contains("!_")) {
								fildcond.append(" OR ").append(fields[j] + " like '%" + keyWord[i]+ "%'  ESCAPE '!'") ;
							} else {
								fildcond.append(" OR ").append(fields[j] + " like '%" + keyWord[i]+ "%'") ;
							}
						}
					}
				}
					fildcond.append(")") ;
				}
				/** 如果为多个关键字时将整个条件用"()"括起来 **/
				if(keyWordLenhth>1){
					fildcond.append(")") ;
				}
				condtion = fildcond.toString();
			}
		}
		System.out.println(condtion);
	}
}
