package cn.flying.rest.service.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

import cn.flying.rest.service.impl.SearchServer;



/**
 * 检索相关
 * @author zhanglei 20131023
 *
 */
public class SearchAssistant {
  
    public static SearchServer searchService;

	private static final int searchExecutorSize = 15;
//	public static final int unitThreadSize = 10;
	public static final int unitThreadSize = 1;
	private static BlockingQueue<DynamicTaskExecutor> searchExecutorPool = new ArrayBlockingQueue<DynamicTaskExecutor>(searchExecutorSize);
	//private static final long queueTimeout = 100;//单位：毫秒
	
	public static final String mainsite_Nationwide = "na";//全国
	public static final String mainsite_Headquarter = "hq";//总部
	
	//缓存时长（单位：秒）
	public static final int expireSeconds = 3600;
	//缓存结果集页数
	//public static final int cachedItemPage = 5;
	
	//缓存key为前缀+检索条件（分索引条目缓存和索引数量缓存，条目缓存条件包含单节点或多节点检索，多节点检索产生数量缓存）
	public static final String cachedKey_itemPrefix = "item_";
	public static final String cachedKey_quantityPrefix = "quantity_";
	//缓存json的key
	public static final String jsonKey_time = "time";//缓存生成时间
	public static final String jsonKey_total = "total";//总数
	//条目缓存使用
	public static final String jsonKey_item = "item";//条目结果（1页）
	//数量缓存使用
	public static final String jsonKey_quantity = "quantity";//各个索引节点数量 json中key为索引节点Id（保持顺序）
	//条目缓存key为索引节点Id，value为item（第1轮查询结果，查询则生成条目缓存）
	
	//元数据名和中文名，暂不更新
	private static final Map<String, String> metadataDisplayMap = new HashMap<String, String>();
	//省份公司
	private static final List<Map<String,String>> provinceList = new ArrayList<Map<String,String>>();
	
	public static void clear(){
		synchronized(metadataDisplayMap){
			metadataDisplayMap.clear();
		}
		synchronized(provinceList){
			provinceList.clear();
		}
	}
	
	/**
	 * 初始化
	 */
	public static synchronized void initialize(){
		SearchAssistant.searchService = new SearchServer();
		//想调用userQuseyService的时候通过SearchAssistant.searchService去获取
//		SearchAssistant.searchService = appService.getUsingService().getSearchService();
//		loadMetadataDisplayNames();//先不加载，服务还没有完全起来，这时候是没有需要的服务的
		
		if(searchExecutorPool.size() > 0){
			System.out.println("SearchExecutorSize:" + searchExecutorPool.size());
			return;
		}
		for (int i = 0; i < searchExecutorSize; i++) {
			DynamicTaskExecutor executor = new DynamicTaskExecutor(unitThreadSize);
			searchExecutorPool.add(executor);
		}
	}
	
	private static void loadMetadataDisplayNames(){
		Map<String, String> metadataDisplayNames = searchService.getMetadataDisplayNames();
		metadataDisplayMap.putAll(metadataDisplayNames);
	}
	
	
	/**
	 * 获取查询线程池（定等待时长，使用完必须放回）
	 */
	public static DynamicTaskExecutor takeExecutor() throws InterruptedException{
		//return searchExecutorPool.poll(queueTimeout, TimeUnit.MILLISECONDS);//take()
		return searchExecutorPool.poll();
	}
	public static void putExecutor(DynamicTaskExecutor executor) throws InterruptedException{
		if(executor != null) searchExecutorPool.put(executor);
	}
	
	
	/**
	 * 获取元数据字段中文名（只能读取）
	 * @return
	 */
	public static Map<String, String> getMetadataDisplayNames(){
		long start = System.currentTimeMillis() ;
		if(metadataDisplayMap.isEmpty()){
			synchronized(metadataDisplayMap){
				if(metadataDisplayMap.isEmpty()){
					loadMetadataDisplayNames();
				}
			}
		}
		System.out.println(System.currentTimeMillis() - start);
		return metadataDisplayMap;
	}
	
	/****
	 * xiaoxiong 20140819
	 * 重新获取元数据中文名集合
	 */
	public static void reloadMetadataDisplayNames(){
		metadataDisplayMap.clear();
		loadMetadataDisplayNames();
	}
	
	public static void removeAllMetadataDisplayName(){
		synchronized(metadataDisplayMap){
			metadataDisplayMap.clear();
		}
	}
	
	/**
	 * 获取省份公司（只能读取）
	 * @return
	 */
//	public static List<Map<String,String>> getProvinceList(){
//		if(provinceList.isEmpty()){
//			synchronized(provinceList){
//				if(provinceList.isEmpty()){
//					List<OrgEntry> orgList = null;
//					try {
////						orgList = userQueryService.getCompanyList();
//						orgList = null;
//					} catch (Exception e) {
//						e.printStackTrace();
//						return provinceList;
//					}
//					for(OrgEntry orgEntry : orgList){
//						if(!IndexGate.onlineMainSite(orgEntry.getMainSite())) continue;
//						Map<String,String> map = new HashMap<String,String>();
//						map.put("provinceId", orgEntry.getOrgid());//查询联动子机构使用
//						map.put("mainSite", orgEntry.getMainSite().toLowerCase());//检索条件使用
//						map.put("provinceName", orgEntry.getOrgName());
//						provinceList.add(map);
//					}
//				}
//			}
//		}
//		return provinceList;
//	}
	
}
