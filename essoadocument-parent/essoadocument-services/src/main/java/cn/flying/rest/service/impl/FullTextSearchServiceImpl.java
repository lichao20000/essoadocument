package cn.flying.rest.service.impl;

import it.sauronsoftware.base64.Base64;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.ws.rs.Path;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapListHandler;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.tokenattributes.OffsetAttribute;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.springframework.stereotype.Component;
import org.wltea.analyzer.lucene.IKAnalyzer;

import cn.flying.rest.entity.ConditionEntry.CompareType;
import cn.flying.rest.entity.ConditionEntry.OccurType;
import cn.flying.rest.platform.impl.BasePlatformService;
import cn.flying.rest.service.IFullTextSearchService;
import cn.flying.rest.service.ILogService;
import cn.flying.rest.service.utils.ConditionEntry;
import cn.flying.rest.service.utils.PageDisplay;
import cn.flying.rest.service.utils.StaticUtil;

@Path("fulltextsearch")
@Component
public class FullTextSearchServiceImpl extends BasePlatformService implements
		IFullTextSearchService {

	@Resource(name = "queryRunner")
	private QueryRunner query;
	private ILogService logService;
	  public ILogService getLogService() {
	    if (this.logService == null) {
	      this.logService = this.getService(ILogService.class);
	    }
	    return logService;
	  }
	
	SearchServer searchserver = new SearchServer();
	public static Map<String, String> metadataNameForcn = new HashMap<String, String>();

	String indexpath = StaticUtil.fullIndexPath;// "D:\\fullindex\\db";
	HashMap<String, IndexReader> indexReaders = null;
	HashMap<String, List<String>> indexsMap = new HashMap<String, List<String>>();

	@SuppressWarnings("unchecked")
	public void getIndexReaders() {
		System.out.println("正在加载全文检索搜索引擎");
		List<Object> luceneIndexReaders = new ArrayList<Object>();
		StringBuffer sb = new StringBuffer(1000);
		Map<String, String> hm = new HashMap<String, String>();
		String sql = "select * from ess_index_nodes";
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			list = query.query(sql, new MapListHandler());
			if(list.isEmpty()){
			  indexsMap = new HashMap<String, List<String>>();
			  return;
			}
			for (Map<String, Object> map : list) {
				sb.append(String.valueOf(map.get("treeNodeId"))).append(",");
				hm.put(String.valueOf(map.get("treeNodeId")),
						String.valueOf(map.get("nodeAddress")));
				/** 给indexsMap赋值取参数 **/
				String treenodeid = String.valueOf(map.get("treeNodeId"));
				if (indexsMap.get(treenodeid) == null) {
					indexsMap.put(treenodeid, new ArrayList<String>());
				}
				// eg: /document_4/4
				indexsMap.get(treenodeid).add("/document_4/" + treenodeid);
			}
			if (sb.length() > 0) {
				sb.deleteCharAt(sb.length() - 1);
			}
			String[] str = sb.toString().split(",");
			luceneIndexReaders.add(str);
			luceneIndexReaders.add(hm);
			// List<String> indexs = (List<String>) luceneIndexReaders.get(0);
			HashMap<String, String> indexToLuceneIndexReadersMap = (HashMap<String, String>) luceneIndexReaders
					.get(1);
			for (String index : str) {
				File indexFile = new File(
						indexToLuceneIndexReadersMap.get(index));
				if (indexFile.exists()) {
					Directory directory = FSDirectory.open(indexFile);
					if (indexReaders == null)
						indexReaders = new HashMap<String, IndexReader>();
					@SuppressWarnings("deprecation")
					IndexReader indexReader = IndexReader.open(directory);
					indexReaders.put(index, indexReader);
				} else {
					System.out.println("该结构的索引文件不存在：" + index + "====="
							+ indexToLuceneIndexReadersMap.get(index));
				}
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public List<HashMap<String, String>> getTypes() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HashMap<String, Object> search(Long i, Long j,
			Map<String, Object> param) {
		long start = System.currentTimeMillis();
		Map<String, Object> r = new HashMap<String, Object>();
		this.getIndexReaders();

		if (indexsMap.isEmpty()) {
			// 如果没有建立过索引库，直接返回
			r.put("error", "没有可以检索的索引库，请创建索引！");
			return (HashMap<String, Object>) r;
		}
		/** 最终会参与检索的结构id集合 **/
		List<String> searchIndexs = new ArrayList<String>();
		/** 已经创建完索引库的结构id集合 **/
		List<String> lucenceds = new ArrayList<String>();
		lucenceds.addAll(indexsMap.keySet());
		/** 组装待查询节点的数据权限 **/
		HashMap<String, List<BooleanQuery>> nodeToRightMap = new HashMap<String, List<BooleanQuery>>();
		String userId = "admin";// (String) param.get("userId");
		boolean isAdmin = false;
		/** admin及拥有admin角色的用户不走权限 **/
		if ("admin".equals(userId)) {
			isAdmin = true;
			searchIndexs = lucenceds;
		}

		String searchWord = (String) param.get("searchWord");// 检索关键词
		if (searchWord != null) {
			/** xiaoxiong 20140819 为了英文不区分大小写，即大写字母也能检索到数据 **/
			searchWord = searchWord.toLowerCase();
		}
		try {
			List<ConditionEntry> condEntryList = new ArrayList<ConditionEntry>();
			/*
			 * if (queryType != SearchEnum.queryType_parent) {
			 * condEntryList.add(new ConditionEntry(StoreField.S_entityId,
			 * StoreEnum.NoChildItem_EntityIdValue, CompareType.EQUAL,
			 * OccurType.MUST_NOT)); }
			 */
			
			/** lujixiang 20150417  添加高级检索条件 --start   **/
			
			String stageCodes = null == param.get("stageCode") ? "" : (String)param.get("stageCode");
			String departmentCodes = null == param.get("departmentCodes") ? "" : (String)param.get("departmentCodes");
			String deviceCodes = null == param.get("deviceCodes") ? "" : (String)param.get("deviceCodes");
			
			String[] stageCodeArr = stageCodes.split("\\|");
			String[] departmentCodeArr = departmentCodes.split("\\|");
			String[] deviceCodeArr = deviceCodes.split("\\|");
			
			/** 过滤空字符串   **/
			List<String> stageCodeList = new ArrayList<String>();
			 for (String tempDe : stageCodeArr) {
				
				 if (null != tempDe && !"".equals(tempDe)) {
					 stageCodeList.add(tempDe.toLowerCase());
				}
			}
			List<String> departmentCodeList = new ArrayList<String>();
			 for (String tempDe : departmentCodeArr) {
				
				 if (null != tempDe && !"".equals(tempDe)) {
					 departmentCodeList.add(tempDe.toLowerCase());
				}
			}
			List<String> deviceCodeList = new ArrayList<String>();
			 for (String tempDe : deviceCodeArr) {
				 
				 if (null != tempDe && !"".equals(tempDe)) {
					 deviceCodeList.add(tempDe.toLowerCase());
				 }
			}
			
			/** 拼接查询条件 **/
			// 收集范围
			 /*if (stageCode != null && stageCode.length() > 0) { //收集范围
			        condEntryList.add(new ConditionEntry("m_stageCode", stageCode.toLowerCase(),
			            CompareType.EQUAL, OccurType.MUST));
			 }*/
			 if (stageCodeList.size() > 1) {
				 condEntryList.add(new ConditionEntry("m_stageCode", stageCodeList, CompareType.MULTIPLE,
			                OccurType.MUST));
			}else if(stageCodeList.size() == 1){
				 condEntryList.add(new ConditionEntry("m_stageCode", stageCodeList.get(0), CompareType.EQUAL, OccurType.MUST));
			}
			 
			 
			 // 部门
			 if (departmentCodeList.size() > 1) {
				 condEntryList.add(new ConditionEntry("m_participatoryCode", departmentCodeList, CompareType.MULTIPLE,
			                OccurType.MUST));
			}else if(departmentCodeList.size() == 1){
				 condEntryList.add(new ConditionEntry("m_participatoryCode", departmentCodeList.get(0), CompareType.EQUAL, OccurType.MUST));
			}
			 
			// 装置
			 if (deviceCodeList.size() > 1) {
				 condEntryList.add(new ConditionEntry("m_deviceCode", deviceCodeList, CompareType.MULTIPLE,
			                OccurType.MUST));
			}else if(deviceCodeList.size() == 1){
				 condEntryList.add(new ConditionEntry("m_deviceCode", deviceCodeList.get(0), CompareType.EQUAL, OccurType.MUST));
			}
			
			/** lujixiang 20150417  添加高级检索条件 --end   **/
			
			String archiveClass = "";
			long startTime = System.currentTimeMillis();
			PageDisplay<Map<String, String>> page = searchserver
					.queryIndexStore(isAdmin, indexReaders, searchIndexs,
							indexsMap, nodeToRightMap, archiveClass,
							searchWord, condEntryList, 1,
							Integer.parseInt(String.valueOf(i)),
							Integer.parseInt(String.valueOf(j)));
			long endTime = System.currentTimeMillis();
			String elapsedTime = endTime - startTime + "ms";
			String resultTotal = String.valueOf(page.getTotal());
			List<Map<String, String>> items = page.getList();
			//[{s_documentflag=0, m_filingDirect=null, m_documentCode=11,
			//m_Attachments=0, m_date=2015-03-10, m_xt=null, m_documentFlag=null,
			//m_docNo=jys450, h_participatoryCode=<font color='red'>11</font>, 
			//m_id=26, m_deviceCode=450, m_stageCode=jys, m_filingFlag=0, m_engineeringCode=111, 
			//h_documentCode=<font color='red'>11</font>, m_title=111, m_itemName=000, m_person=111, m_participatoryCode=11},
			//{s_documentflag=0, m_filingDirect=null, m_documentCode=001, m_Attachments=0, m_date=2015-03-10, m_xt=null, m_documentFlag=null, m_docNo=jys, h_participatoryCode=<font color='red'>11</font>, m_id=27, m_deviceCode=, m_stageCode=jys, m_filingFlag=0, m_engineeringCode=001, m_title=001, m_itemName=001, m_person=admin, m_participatoryCode=11}, {s_documentflag=0, m_filingDirect=null, h_engineeringCode=<font color='red'>11</font>A, m_documentCode=111, m_Attachments=1, m_date=2015-03-04, m_xt=null, m_documentFlag=, m_docNo=啊啊, m_id=25, m_deviceCode=450, m_stageCode=211, m_filingFlag=0, m_engineeringCode=11A, m_title=测试收集数据aaa, m_itemName=文控系统一期项目, m_person=张三, m_participatoryCode=SNEC}]
			List<Map<String, Map<String, String>>> displayList = this
					.createDisplayList(items, 1, isAdmin, userId);
//			List<Map<String, Map<String, String>>> displayList = this
//					.createDisplayList(items, 1, isAdmin, userId, searchWord);
			r.put("elapsedTime", elapsedTime);
			r.put("currentPage", i);
			r.put("resultTotal", resultTotal);
			r.put("displayList", displayList);
			r.put("loadNum", i);
			r.put("loadTime", endTime);
			System.out.println((System.currentTimeMillis() - start) + "ms");
			
			Map<String,Object> log = new HashMap<String,Object>();
		      log.put("ip", param.get("ip"));
		      log.put("userid", param.get("userId"));
		      String stageNames = null == param.get("stageName") ? "" : (String)param.get("stageName");
	            String departmentNames = null == param.get("departmentNames") ? "" : (String)param.get("departmentNames");
	            String deviceNames = null == param.get("deviceNames") ? "" : (String)param.get("deviceNames");
		      /** lujixiang 20150423 添加高级检索日志记录   **/
		      if (stageCodeList.size() > 0 || departmentCodeList.size() > 0 || deviceCodeList.size() > 0) {
		    	  log.put("module", "全文检索");
		    	  log.put("operate", "全文检索：高级检索");
		    	  log.put("loginfo", "全文检索-高级检索 检索关键词为【"+ searchWord+"】的文件"+"\r\n"+
		    			  "筛选条件 ：收集范围名称为:【"+stageNames+"】 "+"\r\n"+
		    			  "单位部门名称为:【"+departmentNames+"】"+"\r\n"+
		    			  "装置名称为：【"+deviceNames+"】"); 
		      }
		      else{
		    	  log.put("module", "全文检索");
			      log.put("operate", "全文检索：检索操作");
			      log.put("loginfo", "全文检索关键词为【"+ searchWord+"】的文件");
		      }
		      this.getLogService().saveLog(log);
			
			return (HashMap<String, Object>) r;
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return null;
	}

	protected static List<String> analyze(String text) throws Exception {
		TokenStream tokenStream = new IKAnalyzer().tokenStream("content", text);
		OffsetAttribute offsetAttr = tokenStream
				.getAttribute(OffsetAttribute.class);
		CharTermAttribute charTermAttr = tokenStream
				.getAttribute(CharTermAttribute.class);
		List<String> termList = new ArrayList<String>();
		while (tokenStream.incrementToken()) {
			char[] charBuf = charTermAttr.buffer();
			String term = new String(charBuf, 0, offsetAttr.endOffset()
					- offsetAttr.startOffset());
			// System.out.println(term + ", " + offsetAttr.startOffset() + ", "
			// + offsetAttr.endOffset());
			termList.add(term);
		}
		tokenStream.close();
		return termList;
	}

  private List<Map<String, Map<String, String>>> createDisplayList(
			List<Map<String, String>> items, int queryType, boolean isAdmin,
			String userId) {
		//boolean groupby = false;
		/** 获取元数据中文 **/
		Map<String, String> metadataDisplayNames = new HashMap<String, String>();
		String sql = "select * from ess_document_metadata";
		try {
			List<Map<String, Object>> list = query.query(sql,
					new MapListHandler());
			for (Map<String, Object> map : list) {
				
				
				/** lujixiang 20150409  **/
				String codeValue = String.valueOf(map.get("code"));
				
				if (!"id".equals(codeValue)	&& !"documentId".equals(codeValue)) {
				  //装置名称、收集范围、专业代码、类型代码、拟定部门代码
				  if("stageCode".equals(codeValue) || "deviceCode".equals(codeValue) || "participatoryCode".equals(codeValue) || 
						  "documentCode".equals(codeValue) || "engineeringCode".equals(codeValue)){
				    continue;
				  }else{
					metadataDisplayNames.put(codeValue,	String.valueOf(map.get("name")));
				  }
				}
			}
			metadataNameForcn = metadataDisplayNames;
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		List<Map<String, Map<String, String>>> displayList = new ArrayList<Map<String, Map<String, String>>>();// 条目数据列表
		HashMap<String, String> doc_map = new HashMap<String, String>();
		List<Map<String, Object>> sysFiledList=getSystemFileds();
		for (Map<String, Object> filed : sysFiledList) {
			
			String codeValue = String.valueOf(filed.get("code"));
			
		  //判断装置名称、收集范围、专业代码、类型代码、拟定部门代码，存储对应名称字段
		  if("stageCode".equals(codeValue) || "deviceCode".equals(codeValue) ||
              "participatoryCode".equals(codeValue) || "documentCode".equals(codeValue) || 
              "engineeringCode".equals(codeValue)){
			  continue ;
          }else{
            doc_map.put("m_"+codeValue, filed.get("name")+"") ;
          }
        }
		//获取系统字段
/*		doc_map.put("m_stageCode", "范围");
		doc_map.put("m_documentCode", "文件代码");
		doc_map.put("m_Attachments", "附件");
		doc_map.put("m_date", "拟定日期");
		doc_map.put("s_documentflag", "挂接文件数");
		doc_map.put("m_docNo", "文件编码");
		doc_map.put("m_deviceCode", "装置号");
		doc_map.put("m_engineeringCode", "分类代码");
		doc_map.put("m_itemName", "项目名称");
		doc_map.put("m_person", "拟定人");
		doc_map.put("m_title", "文件标题");
		doc_map.put("m_participatoryCode", "拟定部门");
		doc_map.put("m_documentId", "文件ID");*/
		//HashMap<String, String> pathToRightMap = new HashMap<String, String>();
		for (Map<String, String> item : items) {// 著录项值的key是前缀+元数据名
			Map<String, Map<String, String>> displayItem = new HashMap<String, Map<String, String>>();
			Map<String, String> tagItem = new LinkedHashMap<String, String>();// 著录项字段
			Map<String, String> sysItem = new LinkedHashMap<String, String>();// 系统字段
			String title = item.get("m_title");
			if ("".equals(title) || title == null || "null".equals(title)) {
				title = "";
			}
			sysItem.put("title", title);
			Set<String> set = item.keySet();
			Iterator<String> it = set.iterator();
			
			sysItem.put("attacheMent", item.get("m_Attachments"));
			int attachMentCount = 0 ;
			
			while (it.hasNext()) {
				String ts = it.next();
				if(ts.contains("stageCode") || ts.contains("deviceCode") || ts.contains("participatoryCode") 
				    || ts.contains("documentCode") ||  ts.contains("engineeringCode")){
				  // ts = ts.substring(0,ts.length()-4)+"Name";
					continue ;
				}
				String tsvalue = item.get(ts);
				if(tsvalue == null || "".equals(tsvalue) || "null".equals(tsvalue)){
                  tsvalue = "";
                }
				//sysItem.put(metadataDisplayNames.get(ts), item.get("m_" + ts));
				/** if (ts.indexOf(SearchEnum.Key_H_metadata_prefix) > -1) {
					String metadata = ts.replace(
							SearchEnum.Key_H_metadata_prefix,
							StoreField.item_metadata_prefix);
					if(doc_map.containsKey(metadata))
						tagItem.put(doc_map.get(metadata), tsvalue);
					else if(metadataDisplayNames.containsKey(metadata.replace("m_", "")))
						tagItem.put(metadataDisplayNames.get(metadata.replace("m_", "")), tsvalue);
				}else**/
				if(!"m_id".equals(ts)&&!"m_documetId".equals(ts)&&!"m_title".equals(ts)){
					if(doc_map.containsKey(ts)){
						sysItem.put(doc_map.get(ts), tsvalue);
					}else if(metadataDisplayNames.containsKey(ts.replace("m_",""))){
						sysItem.put(metadataDisplayNames.get(String.valueOf(ts.replace("m_",""))), tsvalue);
					}
					/** lujixiang 20150414   添加电子文件   **/
					else if (ts.contains("h_t_content_") && !ts.contains("h_t_content_title")) {
						sysItem.put("attacheMent_" + attachMentCount, Base64.encode(tsvalue,"utf-8"));
						sysItem.put("attacheMent_title_" + attachMentCount, 
											null == item.get(ts.replace("h_t_content", "t_content_title")) ? "未知文件" : item.get(ts.replace("h_t_content", "t_content_title")));
						attachMentCount ++ ;
					}
				}else if("m_id".equals(ts)){
					sysItem.put("id",tsvalue);
				}
			}
			/*
			 * [{s_documentflag=0, h_engineeringCode=<font color='red'>aa</font>,关键字
			 * m_documentCode=file1,文件代码 m_Attachments=0, m_date=11, 日期
			 * m_documentFlag=null, m_docNo=cc1,文件编码 m_id=1,元数据ID JJJ
			 * m_deviceCode=94000,装置 m_stageCode=plancode,范围 m_documentId=7, 文件IDJJJ
			 * m_engineeringCode=aa,分类代码 m_title=title1,文件标题 m_code2=gaoyd,元数据2
			 * m_code1=gg,元数据1 m_itemName=test1,项目名称 m_person=gaoyd,拟定人
			 * m_participatoryCode=CJDW}]拟定部门
			 */
			sysItem.put("attacheMentCount", String.valueOf(attachMentCount));
			displayItem.put("tagItem", tagItem);// 已增加高亮显示样式
			displayItem.put("sysItem", sysItem);
			displayList.add(displayItem);
		}
		return displayList;
	}
    /**
     * 获得系统字段的信息
     * @return
     */
	private List<Map<String, Object>> getSystemFileds() {
	  String sql = "select * from ess_document_metadata where isSystem = 0";
	  try {
      List<Map<String, Object>> result=query.query(sql, new MapListHandler());
      return result;
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  @Override
	public HashMap<String, Object> add(HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String delete(Long[] ids,String userId,String ip) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String update(HashMap<String, String> map) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<Map<String, Object>> list(Integer page, Integer rp,
			HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public long getCount(HashMap<String, Object> map) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public Map<String, Object> get(Long id) {
		// TODO Auto-generated method stub
		return null;
	}
	  	 
	
}
