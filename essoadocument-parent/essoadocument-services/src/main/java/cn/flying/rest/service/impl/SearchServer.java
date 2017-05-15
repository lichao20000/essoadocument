package cn.flying.rest.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.lucene.index.IndexReader;
import org.apache.lucene.search.BooleanQuery;

import cn.flying.rest.service.utils.ConditionEntry;
import cn.flying.rest.service.utils.DynamicTaskExecutor;
import cn.flying.rest.service.utils.FulltextSearcher;
import cn.flying.rest.service.utils.PageDisplay;
import cn.flying.rest.service.utils.PageEntry;
import cn.flying.rest.service.utils.PageEntry.ScoreDoc;
import cn.flying.rest.service.utils.QueryCondition;
import cn.flying.rest.service.utils.SearchAssistant;

public class SearchServer {
	private static final String regEx = "[+\\-&|!(){}\\[\\]^\"'“”~*?:\\\\]";

	/**
	 * 关键词查询过滤特殊字符
	 */
	private String filterSearchKeyword(String str) {
		return str.replaceAll(regEx, " ").trim();
	}

	public PageDisplay<Map<String, String>> queryIndexStore(boolean isAdmin,
			HashMap<String, IndexReader> indexReaders,
			List<String> searchIndexs, HashMap<String, List<String>> indexsMap,
			HashMap<String, List<BooleanQuery>> nodeToRightMap,
			String archiveClass, String searchWord,
			List<ConditionEntry> condEntryList, int queryType, int pageNum,
			int pageSize) throws Exception {
		if (searchWord != null) {
			searchWord = this.filterSearchKeyword(searchWord);
			if (searchWord.length() == 0)
				searchWord = null;
		}
		if (searchIndexs.size() == 1) {
			PageDisplay<Map<String, String>> page = this.queryIndexNode(
					isAdmin, indexReaders, searchIndexs, indexsMap,
					nodeToRightMap, archiveClass, searchWord, condEntryList,
					queryType, (pageNum - 1) * pageSize, pageSize, false);
			return page;
		}
		PageDisplay<Map<String, String>> pageGather = null;
		DynamicTaskExecutor executor = SearchAssistant.takeExecutor();
		boolean recover = true;
		if (executor == null) {
			recover = false;
			executor = new DynamicTaskExecutor(SearchAssistant.unitThreadSize);
		}
		try {
			SearchIndexNodeTask nodeTask = new SearchIndexNodeTask(isAdmin,
					indexReaders, searchIndexs, indexsMap, nodeToRightMap,
					archiveClass, searchWord, condEntryList, queryType,
					(pageNum - 1) * pageSize, pageSize, false);
			executor.execute(nodeTask);
			if (nodeTask != null) {
				executor.waitComplete();
				if (nodeTask.result == null) {
					System.out.println("SearchResultNull!");
				} else {
					pageGather = new PageDisplay<Map<String, String>>();
					pageGather.setList(nodeTask.result.getList());
					pageGather.setTotal(nodeTask.result.getTotal());
					return pageGather;
				}
			}
			pageGather = new PageDisplay<Map<String, String>>();
			pageGather.setTotal(0);
			pageGather.setList(new ArrayList<Map<String, String>>());
			return pageGather;
		} finally {
			if (recover) {
				SearchAssistant.putExecutor(executor);
			} else {
				executor.shutdown();
			}
		}
	}

	@SuppressWarnings("unchecked")
	private PageDisplay<Map<String, String>> queryIndexNode(boolean isAdmin,
			HashMap<String, IndexReader> indexReaders,
			List<String> searchIndexs, HashMap<String, List<String>> indexsMap,
			HashMap<String, List<BooleanQuery>> nodeToRightMap,
			String archiveClass, String searchWord,
			List<ConditionEntry> condEntryList, int queryType, int start,
			int limit, boolean totalOnly) throws Exception {
		Map<String, Object> param = new HashMap<String, Object>();
		param.put("searchIndexs", searchIndexs);
		param.put("indexReaders", indexReaders);
		param.put("indexsMap", indexsMap);
		param.put("nodeToRightMap", nodeToRightMap);
		param.put("isAdmin", isAdmin);
		param.put("searchWord", searchWord);
		param.put("queryType", queryType);
		param.put("totalOnly", totalOnly);// 是否只是用来查询总数
		List<Map<String, Object>> condMapArray = new ArrayList<Map<String, Object>>();
		for (ConditionEntry condEntry : condEntryList) {
			Map<String, Object> condMap = new HashMap<String, Object>();
			condMap.put("fieldName", condEntry.getFieldName());
			condMap.put("singleValue", condEntry.getSingleValue());// 档案类型
			condMap.put("multiValues", condEntry.getMultiValues());// 范围、多值查询使用
			condMap.put("compareType", condEntry.getCompareType());// 查询关系 like
																	// equle
			condMap.put("occurType", condEntry.getOccurType());// 并且 或者 非
			condMapArray.add(condMap);
		}
		param.put("condMapArray", condMapArray);
		if (archiveClass != null && archiveClass.length() > 0) {
			param.put("archiveClass", archiveClass);
		}

		PageDisplay<Map<String, String>> page = new PageDisplay<Map<String, String>>();
		Map<String, Object> returnMap = null;
		try {
			returnMap = this.queryIndex(start, limit, param);
		} catch (Exception e) {
			e.printStackTrace();
			page.setError("服务不可用");
			return page;
		}
		page.setTotal((Long) returnMap.get("total"));
		if (!totalOnly) {
			page.setList((List<Map<String, String>>) returnMap.get("list"));
		}
		return page;
	}

	/**
	 * 获取元数据中文名
	 * 
	 * @return
	 */
	public Map<String, String> getMetadataDisplayNames() {
		return FullTextSearchServiceImpl.metadataNameForcn;
	}

	private class SearchIndexNodeTask implements Runnable {
		PageDisplay<Map<String, String>> result;

		private HashMap<String, IndexReader> indexReaders;
		private List<String> searchIndexs;
		private HashMap<String, List<String>> indexsMap;
		private HashMap<String, List<BooleanQuery>> nodeToRightMap;
		private String archiveClass;
		private String searchWord;
		private List<ConditionEntry> condEntryList;
		private int queryType;
		private int start;
		private int limit;
		boolean totalOnly;
		boolean isAdmin;

		SearchIndexNodeTask(boolean isAdmin,
				HashMap<String, IndexReader> indexReaders,
				List<String> searchIndexs,
				HashMap<String, List<String>> indexsMap,
				HashMap<String, List<BooleanQuery>> nodeToRightMap,
				String archiveClass, String searchWord,
				List<ConditionEntry> condEntryList, int queryType, int start,
				int limit, boolean totalOnly) {
			this.indexReaders = indexReaders;
			this.searchIndexs = searchIndexs;
			this.indexsMap = indexsMap;
			this.nodeToRightMap = nodeToRightMap;
			this.archiveClass = archiveClass;
			this.searchWord = searchWord;
			this.condEntryList = condEntryList;
			this.queryType = queryType;
			this.start = start;
			this.limit = limit;
			this.totalOnly = totalOnly;
			this.isAdmin = isAdmin;
		}

		@Override
		public void run() {
			try {
				result = queryIndexNode(isAdmin, indexReaders, searchIndexs,
						indexsMap, nodeToRightMap, archiveClass, searchWord,
						condEntryList, queryType, start, limit, totalOnly);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> queryIndex(int start, int limit,
			Map<String, Object> param) {
		String searchWord = (String) param.get("searchWord");
		List<Map<String, Object>> condMapArray = (List<Map<String, Object>>) param
				.get("condMapArray");
		String afterDoc = (String) param.get("afterDoc");// 此值在调用此方法的时候根本没传过啊
		String afterScore = (String) param.get("afterScore");
		Boolean totalOnly = (Boolean) param.get("totalOnly");
		if (null == totalOnly) {
			totalOnly = false;
		}
		QueryCondition queryParam = new QueryCondition();
		queryParam.setTotalOnly(totalOnly);
		queryParam.setSearchWord(searchWord);
		// queryParam.setMainSiteMap(mainSiteMap);
		// 查询条件没有地区的限制了,故参数也没用了,屏蔽掉,给个null
		queryParam.setMainSiteMap(null);
		// queryParam.setCompanyOrgMap(companyOrgMap);
		List<ConditionEntry> condEntryList = new ArrayList<ConditionEntry>();
		for (Map<String, Object> condMap : condMapArray) {
			ConditionEntry condEntry = new ConditionEntry();
			condEntry.setFieldName((String) condMap.get("fieldName"));
			condEntry.setSingleValue((String) condMap.get("singleValue"));
			condEntry.setMultiValues((List<String>) condMap.get("multiValues"));
			condEntry.setCompareType((Integer) condMap.get("compareType"));
			condEntry.setOccurType((Integer) condMap.get("occurType"));
			condEntryList.add(condEntry);
		}
		queryParam.setCondEntryList(condEntryList);
		PageEntry pageParam = new PageEntry();
		pageParam.setStart(start);
		pageParam.setLimit(limit);
		List<String> searchIndexs = (List<String>) param.get("searchIndexs");
		HashMap<String, IndexReader> indexReaders = (HashMap<String, IndexReader>) param
				.get("indexReaders");
		HashMap<String, List<String>> indexsMap = (HashMap<String, List<String>>) param
				.get("indexsMap");
		HashMap<String, List<BooleanQuery>> nodeToRightMap = (HashMap<String, List<BooleanQuery>>) param
				.get("nodeToRightMap");

		boolean isAdmin = (Boolean) param.get("isAdmin");
		try {
			PageDisplay<Map<String, String>> page = null;
			if (afterDoc != null && afterScore != null) {
				pageParam.setAfterDoc(new ScoreDoc(Integer.parseInt(afterDoc),
						Float.parseFloat(afterScore)));
			}
			page = FulltextSearcher.getInstance().search(isAdmin, indexReaders,
					searchIndexs, indexsMap, nodeToRightMap, queryParam,
					pageParam);
			Map<String, Object> res = new HashMap<String, Object>();
			res.put("total", page.getTotal());
			if (!totalOnly)
				res.put("list", page.getList());
			return res;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
}
