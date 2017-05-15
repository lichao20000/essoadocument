package cn.flying.rest.service.utils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexableField;
import org.apache.lucene.index.MultiReader;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TermRangeQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.TopScoreDocCollector;
import org.apache.lucene.search.WildcardQuery;
import org.apache.lucene.search.highlight.Highlighter;
import org.apache.lucene.search.highlight.TokenSources;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.BytesRef;

import cn.flying.rest.service.utils.ConditionEntry.CompareType;
import cn.flying.rest.service.utils.ConditionEntry.OccurType;
import cn.flying.rest.service.utils.TextFormater.KeywordPattern;


public class FulltextSearcher {
	private static FulltextSearcher instance = new FulltextSearcher();
	
	//key：模块
	private Map<String,ModuleSearchManager> managerMap = new HashMap<String,ModuleSearchManager>();
	
	private static final boolean bIncludeEqual = true;//范围否闭区间
	
	private FulltextSearcher(){
		
	}
	public static FulltextSearcher getInstance(){
		return instance;
	}
	
	/*protected void open(String module, ModuleWriteManager writeManager) throws IOException{
		//读索引对象indexReader、indexSearcher在索引更新时更新
		ModuleSearchManager searchManager = managerMap.get(module);
		if(searchManager == null){
			searchManager = new ModuleSearchManager(writeManager.getTrackingIndexWriter());
			writeManager.setSearchManager(searchManager);
			searchManager.start();
			managerMap.put(module, searchManager);
		}
	}*/
	
	protected void close(String module){
		ModuleSearchManager searchManager = managerMap.get(module);
		if(searchManager != null){
			searchManager.close();
		}
	}
	
	//查询时可等待特定索引变更
	protected void waitForGeneration(String module, long generation) throws Exception{
		ModuleSearchManager searchManager = managerMap.get(module);
		if(searchManager != null){
			searchManager.waitForGeneration(generation);
		}
	}
	
	//改为ControlledRealTimeReopenThread刷新，此处为手动
	protected void refresh(String module, boolean wait) throws Exception{
		ModuleSearchManager searchManager = managerMap.get(module);
		if(searchManager != null){
			searchManager.refresh(wait);
		}
	}
	
	private AcquireResult acquire(String module) throws Exception{
		if(module == null) throw new RuntimeException();
//		if(managerMap==null || managerMap.get(module)==null){
//		  FulltextAgent.openFSDirectory(module);
//		  FulltextWriter.getInstance().initIndex(module);// 索引库尚未创建情况
//		  ModuleWriteManager writeManager = FulltextWriter.getInstance().open(module);
//		  FulltextSearcher.getInstance().open(module, writeManager);
//		}
		IndexSearcher indexSearcher = managerMap.get(module).getSearcherManager().acquire();
		return new AcquireResult(module, indexSearcher);
	}
	private void release(AcquireResult acquireResult) throws Exception{
		if(acquireResult.subSearchers == null){
			managerMap.get(acquireResult.module).getSearcherManager().release(acquireResult.indexSearcher);
		}else{
			acquireResult.indexSearcher.getIndexReader().close();
			for(String module : acquireResult.modules){
				IndexSearcher subSearcher = acquireResult.subSearchers.get(module);
				managerMap.get(module).getSearcherManager().release(subSearcher);
			}
		}
	}
	
	/**
	 * 检索
	 * @param isAdmin 
	 * @param indexReaders 
	 * @param nodeToRightMap 
	 * @param structureidToNodesMap 
	 * @param queryParam
	 * @param pageParam
	 * @return
	 * @throws Exception
	 */
	public PageDisplay<Map<String,String>> search(boolean isAdmin, HashMap<String, IndexReader> indexReaders, List<String> searchIndexs, HashMap<String, List<String>> indexsMap, HashMap<String, List<BooleanQuery>> nodeToRightMap, QueryCondition queryParam, PageEntry pageParam) throws Exception{
		PageDisplay<Map<String,String>> page = new PageDisplay<Map<String,String>>();
		String searchWord = queryParam.getSearchWord();
		Map<String, KeywordPattern> keywordPatternMap = null;
		QueryResult fileQueryResult = null;/** xiaoxiong 20140905 案卷数据检索 **/
		QueryResult queryResult = null;
		Highlighter highlighter = null;
		if(searchWord != null){
			/** xiaoxiong 20140714 检索时不用再调用分词器了，直接按空格分开检索就OK **/
			List<String> keywordList = new ArrayList<String>() ;
			String[] words = searchWord.split(" ");
			for(String word:words){
				if(word.trim().length()>0)keywordList.add(word) ;
			}
			keywordPatternMap = TextFormater.getKeywordPattern(keywordList);
			if(isAdmin){
				queryResult = this.createQuery(isAdmin, queryParam, keywordList, false);
			} else {
				queryResult = this.createQuery(isAdmin, queryParam, keywordList, false);
				fileQueryResult = this.createQuery(isAdmin, queryParam, keywordList, true);
				highlighter = TextFormater.getHighlighter(queryResult.keywordQuery);
			}
		}else{
			queryResult = this.createQuery(isAdmin, queryParam, null, false);
		}
		
		IndexReader searcher = null ;
		ArrayList<IndexReader> allIndexReaders = null;
		HashMap<String, Query> querys = new HashMap<String, Query>() ;
		for (String index : searchIndexs) {
			searcher = indexReaders.get(index);
			if (null != searcher) {
				if (null == allIndexReaders) {
					allIndexReaders = new ArrayList<IndexReader>();
				}
				allIndexReaders.add(searcher);
				if(!isAdmin){
					if(nodeToRightMap.get(index) == null){
						querys.put(((FSDirectory)((DirectoryReader)searcher).directory()).getDirectory().getPath(), queryResult.query) ;
					} else {
						if(nodeToRightMap.get(index).size() == 1){
							BooleanQuery booleanQuery = new BooleanQuery();
							/**添加数据授权条件**/
							booleanQuery.add(nodeToRightMap.get(index).get(0),Occur.MUST);
							/**数据检索条件**/
							booleanQuery.add(queryResult.query, Occur.MUST);
							querys.put(((FSDirectory)((DirectoryReader)searcher).directory()).getDirectory().getPath(), booleanQuery) ;
						} else {
							BooleanQuery booleanQuery = new BooleanQuery();
							BooleanQuery fileBooleanQuery = new BooleanQuery();
							BooleanQuery innerfileBooleanQuery = new BooleanQuery();
							/** 1、案卷 **/
							if(nodeToRightMap.get(index).get(0) == null){
								fileBooleanQuery.add(fileQueryResult.query, Occur.MUST) ;
							} else if(nodeToRightMap.get(index).get(0).equals(new BooleanQuery())){
								fileBooleanQuery = null ;
							} else {
								/**添加数据授权条件**/
								fileBooleanQuery.add(nodeToRightMap.get(index).get(0),Occur.MUST);
								/**数据检索条件**/
								fileBooleanQuery.add(fileQueryResult.query, Occur.MUST);
							}
							/** 2、卷内 **/
							if(nodeToRightMap.get(index).get(1) == null){
								innerfileBooleanQuery.add(queryResult.query, Occur.MUST) ;
							} else if(nodeToRightMap.get(index).get(1).equals(new BooleanQuery())){
								innerfileBooleanQuery = null ;
							} else {
								/**添加数据授权条件**/
								innerfileBooleanQuery.add(nodeToRightMap.get(index).get(1),Occur.MUST);
								/**数据检索条件**/
								innerfileBooleanQuery.add(queryResult.query, Occur.MUST);
							}
							/**添加案卷条件**/
							if(fileBooleanQuery != null){
								booleanQuery.add(fileBooleanQuery, Occur.SHOULD);
							}
							/**数据卷内条件**/
							if(innerfileBooleanQuery != null){
								booleanQuery.add(innerfileBooleanQuery, Occur.SHOULD);
							}
							querys.put(((FSDirectory)((DirectoryReader)searcher).directory()).getDirectory().getPath(), booleanQuery) ;
							
						}
					}
				}
			}
		}
		MultiReader multiReader = null;
		if (allIndexReaders != null && allIndexReaders.size() > 0) {
			allIndexReaders.trimToSize();
			multiReader = new MultiReader((IndexReader[]) allIndexReaders.toArray(new IndexReader[allIndexReaders.size()]));
		}
		MyIndexSearcher multiSearcher = new MyIndexSearcher(multiReader);
		TopScoreDocCollector results = TopScoreDocCollector.create(pageParam.getStart()+pageParam.getLimit(), false);
		if(isAdmin){
			multiSearcher.search(queryResult.query, results);
		} else {
			multiSearcher.search(querys, results);
		}
		int total = results.getTotalHits() ;
		page.setTotal(total);
		if(queryParam.isTotalOnly()) return page;
		List<Map<String,String>> list = new ArrayList<Map<String,String>>();
		searchFullTextResult(results, pageParam.getStart(), pageParam.getLimit(), multiSearcher, keywordPatternMap, highlighter, list);
		page.setList(list);
		/** lujixiang 20150331 关闭内存中的索引信息 **/
		multiReader.close();
		return page;
	}
	
	/**
	 * 获取检索结果数据
	 * @param results
	 * @param start
	 * @param end
	 * @param isearcher
	 * @param keywordPatternMap
	 * @param highlighter
	 * @param list
	 */
	private void searchFullTextResult(TopScoreDocCollector results, int start,
			int limit,IndexSearcher isearcher, Map<String, KeywordPattern> keywordPatternMap,
			Highlighter highlighter,List<Map<String,String>> list){
		try {
			ScoreDoc[] scoreDocs = results.topDocs(start,limit).scoreDocs;
			int length = scoreDocs.length ;
			for(int i = 0; i < length; i++){
				int docId = scoreDocs[i].doc;
				Document document = isearcher.doc(docId);
				Map<String,String> map = new LinkedHashMap<String,String>();
				List<IndexableField> fields = document.getFields();
				String stringValue = null;
				for(Iterator<IndexableField> iter = fields.iterator(); iter.hasNext();){
		            IndexableField field = iter.next();
		            if(field.name().startsWith(StoreField.item_string_prefix) || field.name().startsWith(StoreField.parent_string_prefix)){//liqiubo 20140526 为了检索的时候能把案卷查出来，故加入此判断,理论上两个前缀不会同时出现的
		            	if((stringValue = field.stringValue()) != null){
		            		map.put(field.name(), stringValue);
		            	}
		            }else if(field.name().startsWith(StoreField.item_metadata_prefix) || field.name().startsWith(StoreField.parent_metadata_prefix) || field.name().startsWith(StoreField.T_FJ_content) || field.name().startsWith(StoreField.T_content) || field.name().startsWith(StoreField.T_CLD_content)){//liqiubo 20140526 为了检索的时候能把案卷查出来，故加入此判断,理论上两个前缀不会同时出现的
		            	if((stringValue = field.stringValue()) != null){
		            		map.put(field.name(), stringValue);
		            		if(keywordPatternMap != null){
		            			this.createHighlightedMetadata(field.name(), stringValue, keywordPatternMap, map, false);
		            		}
		            	}
		            }
		        }
				this.createTitle(keywordPatternMap, map, false);
				String fileId = map.get(StoreField.S_fileId);
				String filePath = map.get(StoreField.S_filePath);
				if(fileId != null && highlighter != null){
					try {
						this.createSnippet(filePath, fileId, isearcher.getIndexReader(), docId, highlighter, map);
					} catch (Exception e) {
						e.printStackTrace();
					}
					map.remove(StoreField.S_fileId);
					map.remove(StoreField.S_filePath);
				}
				list.add(map);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 高亮标题
	 */
	private void createTitle(Map<String, KeywordPattern> keywordPatternMap, Map<String,String> item, boolean groupby){
		String title = item.get(groupby ? StoreField.P_M_Title : StoreField.M_Title);
		if(title == null || title.length() == 0){
			title = item.get(groupby ? StoreField.P_M_Summary : StoreField.M_Summary);
			if(title == null) return;
		}
		if(keywordPatternMap == null){
			item.put(SearchEnum.Key_H_title, title);
			return;
		}
		String highlightedText = TextFormater.createHighlightedText(title, keywordPatternMap);
		if(highlightedText != null){
			item.put(SearchEnum.Key_H_title, highlightedText);
		}else{
			item.put(SearchEnum.Key_H_title, title);
		}
	}
	
	/**
	 * 高亮摘要
	 */
	private void createSnippet(String filePath, String fileId, IndexReader indexReader, int docId, Highlighter highlighter, Map<String,String> item) throws Exception{
		String context = IndexText.getDocumentText(filePath, fileId);
		TokenStream tokenStream = this.getTokenStreamWithOffsets(indexReader, docId, StoreField.T_content);
		String snippet = highlighter.getBestFragment(tokenStream, context);
		if(snippet == null) snippet = context.substring(0, context.length() < TextFormater.fragCharSize ? context.length() : TextFormater.fragCharSize);
		item.put(SearchEnum.Key_H_snippet, TextFormater.trimPunctuation(snippet));
	}
	protected static TokenStream getTokenStreamWithOffsets(IndexReader reader, int docId, String field)
		      throws IOException {
		    return TokenSources.getTokenStreamWithOffsets(reader, docId, field);
	}
	/**
	 * 高亮著录项
	 */
	private void createHighlightedMetadata(String metaField, String metaValue, Map<String, KeywordPattern> keywordPatternMap, Map<String,String> item, boolean groupby){
		String highlightedText = TextFormater.createHighlightedText(metaValue, keywordPatternMap);
		if(highlightedText != null){
          /*if(groupby){
              item.put(metaField.replaceAll(StoreField.parent_metadata_prefix, SearchEnum.Key_P_H_metadata_prefix), highlightedText);
          }else{
              item.put(metaField.replaceAll(StoreField.item_metadata_prefix, SearchEnum.Key_H_metadata_prefix), highlightedText);
          }*/
		  item.put(metaField.replace("t_content_", "h_t_content_"),highlightedText);
      }else{
        item.put(metaField, metaValue);
      }
	}
	
	
	
	private QueryResult createQuery(boolean isAdmin, QueryCondition queryParam, List<String> keywordList, boolean isFile){
      BooleanQuery kQuery = null;//检索条件
      BooleanQuery contentQuery = null;//获取摘要使用
      if(keywordList != null && keywordList.size() > 0){
          /*QueryParser parser = new QueryParser(Version.LUCENE_44, StoreField.T_content, FulltextAgent.getAnalyzer());
          Query query = parser.parse(searchWord);*/
          kQuery = new BooleanQuery();
          contentQuery = new BooleanQuery();
          TermQuery query = null;
          if(isAdmin){
        	  for(String keyword : keywordList){
    			  query = new TermQuery(new Term(StoreField.P_T_label, keyword));
    			  kQuery.add(query, Occur.SHOULD);
    			  query = new TermQuery(new Term(StoreField.T_label, keyword));
    			  kQuery.add(query, Occur.SHOULD);
    			  query = new TermQuery(new Term(StoreField.T_content, keyword));
    			  kQuery.add(query, Occur.SHOULD);
    			  query = new TermQuery(new Term(StoreField.T_FJ_content, keyword));
    			  kQuery.add(query, Occur.SHOULD);
    			  query = new TermQuery(new Term(StoreField.T_CLD_content, keyword));
    			  kQuery.add(query, Occur.SHOULD);
    			  contentQuery.add(query, Occur.SHOULD);
        	  }
          } else {
        	  for(String keyword : keywordList){
        		  if(isFile){
        			  /** xiaoxiong 20140905 案卷 **/
        			  query = new TermQuery(new Term(StoreField.P_T_label, keyword));
        			  kQuery.add(query, Occur.SHOULD);
        			  contentQuery.add(query, Occur.SHOULD);
        		  } else {
        			  /** xiaoxiong 20140905 卷内 **/
        			  query = new TermQuery(new Term(StoreField.T_label, keyword));
        			  kQuery.add(query, Occur.SHOULD);
        			  query = new TermQuery(new Term(StoreField.T_content, keyword));
        			  kQuery.add(query, Occur.SHOULD);
        			  query = new TermQuery(new Term(StoreField.T_FJ_content, keyword));
        			  kQuery.add(query, Occur.SHOULD);
        			  query = new TermQuery(new Term(StoreField.T_CLD_content, keyword));
        			  kQuery.add(query, Occur.SHOULD);
        			  contentQuery.add(query, Occur.SHOULD);
        		  }
        	  }
          }
      }
      if(queryParam == null) return new QueryResult(null, contentQuery);
      
      BooleanQuery bQuery = new BooleanQuery();
      BooleanQuery timeQuery = null;
      List<ConditionEntry> condEntryList = queryParam.getCondEntryList();
      for(ConditionEntry condEntry : condEntryList){
        //liqiubo 20140526 为了查询出案卷，将此条件去掉
        if(StoreField.S_entityId.equals(condEntry.getFieldName())){
          continue;
        }
        if("createTime_long".equals(condEntry.getFieldName())){
          timeQuery = new BooleanQuery();
          timeQuery.add(this.createQuery(condEntry), occurMap.get(condEntry.getOccurType()));
          ConditionEntry ce = new ConditionEntry("editTime_long", condEntry.getMultiValues(), CompareType.RANGE, OccurType.SHOULD);
          timeQuery.add(this.createQuery(ce), Occur.SHOULD);
          continue;
        }
          bQuery.add(this.createQuery(condEntry), occurMap.get(condEntry.getOccurType()));
      }
      if(kQuery != null) bQuery.add(kQuery, Occur.MUST);
      if(timeQuery != null) bQuery.add(timeQuery, Occur.MUST);
      return new QueryResult(bQuery, contentQuery);
  }
	
	
	
	private static final Map<Integer,Occur> occurMap = new HashMap<Integer,Occur>();
	static {
		occurMap.put(OccurType.MUST, Occur.MUST);
		occurMap.put(OccurType.SHOULD, Occur.SHOULD);
		occurMap.put(OccurType.MUST_NOT, Occur.MUST_NOT);
	}
	
	private Query createQuery(ConditionEntry condEntry){
		switch(condEntry.getCompareType()){
			case CompareType.EQUAL:
				return new TermQuery(new Term(condEntry.getFieldName(), condEntry.getSingleValue()));
				//break;
			case CompareType.LIKE:
				//*代表0个或多个，?代表0个或1个
				return new WildcardQuery(new Term(condEntry.getFieldName(), "*" + condEntry.getSingleValue() + "*"));
			case CompareType.RANGE:
				TermRangeQuery rq = null;
				String value1 = condEntry.getMultiValues().get(0);
				String value2 = condEntry.getMultiValues().get(1);
				if(value1 != null && value2 != null){
					rq = new TermRangeQuery(condEntry.getFieldName(), new BytesRef(value1), new BytesRef(value2), bIncludeEqual, bIncludeEqual);
				}else if(value1 == null && value2 != null){
					rq = new TermRangeQuery(condEntry.getFieldName(), null, new BytesRef(value2), bIncludeEqual, bIncludeEqual);
				}else if(value1 != null && value2 == null){
					rq = new TermRangeQuery(condEntry.getFieldName(), new BytesRef(value1), null, bIncludeEqual, bIncludeEqual);
				}
				return rq;
			case CompareType.MULTIPLE:
				List<String> multiValues = condEntry.getMultiValues();
				if(multiValues.size() > 1){
					BooleanQuery mq = new BooleanQuery();
					for(String value : multiValues){
						TermQuery query = new TermQuery(new Term(condEntry.getFieldName(), value));
						mq.add(query, Occur.SHOULD);
					}
					return mq;
				}else{
					return new TermQuery(new Term(condEntry.getFieldName(), multiValues.get(0)));
				}
			default:
				return new TermQuery(new Term(condEntry.getFieldName(), condEntry.getSingleValue()));
		}
	}
	
	protected Query createQuery(ConditionEntry[] condEntryArr){
		BooleanQuery bQuery = new BooleanQuery();
		for(ConditionEntry condEntry : condEntryArr){
			bQuery.add(this.createQuery(condEntry), occurMap.get(condEntry.getOccurType()));
		}
		return bQuery;
	}
	
	/**
	 * 单条件查询（建索引使用）
	 */
	public PageDisplay<Map<String,String>> search(String module, PageEntry pageParam, ConditionEntry... condEntryArr) throws Exception{
		Query query = this.createQuery(condEntryArr);
		return this.search(module, pageParam, query);
	}
	public PageDisplay<Map<String,String>> search(String module, PageEntry pageParam, Query query) throws Exception{
		PageDisplay<Map<String,String>> page = new PageDisplay<Map<String,String>>();
		AcquireResult acquireResult = this.acquire(module);
		IndexSearcher indexSearcher = acquireResult.indexSearcher;
		try {
			int n = pageParam.getStart() + pageParam.getLimit();
			TopDocs topDocs = null;
			if(pageParam.getSortBy() != null){
				Sort sort = new Sort(new SortField(pageParam.getSortBy().sort, 
						pageParam.getSortBy().numerical ? SortField.Type.LONG : SortField.Type.STRING, 
						pageParam.getSortBy().reverse));//true:DESC false:ASC SortField.FIELD_SCORE
				topDocs = indexSearcher.search(query, n, sort);
			}else{
				topDocs = indexSearcher.search(query, n);
			}
			page.setTotal(topDocs.totalHits);
			ScoreDoc[] scoreDocs = topDocs.scoreDocs;
			int size = scoreDocs.length;
			List<Map<String,String>> list = new ArrayList<Map<String,String>>();
			for(int i=pageParam.getStart(); i<size; i++){
				int docId = scoreDocs[i].doc;
				Document document = indexSearcher.doc(docId);
				Map<String,String> map = new HashMap<String,String>();
				List<IndexableField> fields = document.getFields();
				for(Iterator<IndexableField> iter = fields.iterator(); iter.hasNext();){
		            IndexableField field = iter.next();
		            if(field.stringValue() != null) map.put(field.name(), field.stringValue());
		        }
				list.add(map);
			}
			page.setList(list);
		} finally {
			this.release(acquireResult);
		}
		return page;
	}
	
	/**
	 * 获取索引ID（获取卷内索引ID）
	 */
	public PageDisplay<Integer> searchDocId(String module, PageEntry pageParam, ConditionEntry... condEntryArr) throws Exception{
		PageDisplay<Integer> page = new PageDisplay<Integer>();
		AcquireResult acquireResult = this.acquire(module);
		IndexSearcher indexSearcher = acquireResult.indexSearcher;
		try {
			Query query = this.createQuery(condEntryArr);
			int n = pageParam.getStart() + pageParam.getLimit();
			TopDocs topDocs = null;
			if(pageParam.getSortBy() != null){
				Sort sort = new Sort(new SortField(pageParam.getSortBy().sort, 
						pageParam.getSortBy().numerical ? SortField.Type.LONG : SortField.Type.STRING, 
						pageParam.getSortBy().reverse));//true:DESC false:ASC SortField.FIELD_SCORE
				topDocs = indexSearcher.search(query, n, sort);
			}else{
				topDocs = indexSearcher.search(query, n);
			}
			page.setTotal(topDocs.totalHits);
			ScoreDoc[] scoreDocs = topDocs.scoreDocs;
			int size = scoreDocs.length;
			List<Integer> list = new ArrayList<Integer>();
			for(int i=pageParam.getStart(); i<size; i++){
				list.add(scoreDocs[i].doc);
			}
			page.setList(list);
		} finally {
			this.release(acquireResult);
		}
		return page;
	}
	
	/**
	 * 获取Document（获取卷内索引信息）
	 */
	public Document doc(String module, int docId) throws Exception{
		AcquireResult acquireResult = this.acquire(module);
		IndexSearcher indexSearcher = acquireResult.indexSearcher;
		try {
			return indexSearcher.doc(docId);
		} finally {
			this.release(acquireResult);
		}
	}
	
	private class AcquireResult {
		String module;
		List<String> modules;
		IndexSearcher indexSearcher;
		Map<String,IndexSearcher> subSearchers;
		AcquireResult(String module, IndexSearcher indexSearcher){
			this.module = module;
			this.indexSearcher = indexSearcher;
		}
		AcquireResult(List<String> modules, IndexSearcher MultiSearcher, Map<String,IndexSearcher> subSearchers){
			this.modules = modules;
			this.indexSearcher = MultiSearcher;
			this.subSearchers = subSearchers;
		}
	}
	
	private class QueryResult {
		Query query;
		Query keywordQuery;
		QueryResult(Query query, Query keywordQuery){
			this.query = query;
			this.keywordQuery = keywordQuery;
		}
	}
	
	
	public void closeSearcher(String module) throws Exception{
	  if(managerMap.get(module)!=null){
	    managerMap.get(module).close();
	    managerMap.remove(module);
	  }
	} 
}
