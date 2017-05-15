package cn.flying.rest.service.utils;

import java.io.IOException;

import org.apache.lucene.index.TrackingIndexWriter;
import org.apache.lucene.search.ControlledRealTimeReopenThread;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ReferenceManager;
import org.apache.lucene.search.ReferenceManager.RefreshListener;
import org.apache.lucene.search.SearcherFactory;
import org.apache.lucene.search.SearcherManager;

/**
 * 索引单元查询（省份）
 * @author zhanglei 20131120
 *
 */
public class ModuleSearchManager {
	//private static DirectoryReader directoryReader;
	//private static IndexSearcher indexSearcher;
	
	//Maximum time until a new reader must be opened; this sets the upper bound on how slowly reopens may occur, when no caller is waiting for a specific generation to become visible.
	private static final double targetMaxStaleSec = 5.0;
	//Mininum time until a new reader can be opened; this sets the lower bound on how quickly reopens may occur, when a caller is waiting for a specific generation to become visible.
	private static final double targetMinStaleSec = 0.025;//25秒
	private ReferenceManager<IndexSearcher> searcherManager;
	private ControlledRealTimeReopenThread<IndexSearcher> reopenThread;
	
	protected ModuleSearchManager(TrackingIndexWriter trackingIndexWriter) throws IOException {
		//directoryReader = DirectoryReader.open(directory);
		//indexSearcher = new IndexSearcher(directoryReader);//ExecutorService executor
		
		//searcherManager = new SearcherManager(directory, new SearcherFactory());
		
		searcherManager = new SearcherManager(trackingIndexWriter.getIndexWriter(), true, new SearcherFactory());
		searcherManager.addListener(new ModuleRefreshListener());
		reopenThread = new ControlledRealTimeReopenThread<IndexSearcher>(trackingIndexWriter, searcherManager, 
				targetMaxStaleSec, targetMinStaleSec);
		reopenThread.setDaemon(true);
	}
	
	protected ReferenceManager<IndexSearcher> getSearcherManager() {
		return searcherManager;
	}
	
	protected void start(){
		reopenThread.start();
	}
	
	protected void close(){
		try {
			if(reopenThread != null) reopenThread.close();
			if(searcherManager != null) searcherManager.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	protected void waitForGeneration(long generation) throws Exception{
		reopenThread.waitForGeneration(generation);
	}
	
	protected void refresh(boolean wait) throws Exception{
		//DirectoryReader directoryReaderNew = DirectoryReader.openIfChanged(directoryReader);//正在查询时更新问题
		if(wait){
			searcherManager.maybeRefreshBlocking();//等待刷新
		}else{
			searcherManager.maybeRefresh();
		}
	}
	
	private static class ModuleRefreshListener implements RefreshListener{
		@Override
		public void beforeRefresh() throws IOException {
			
		}
		@Override
		public void afterRefresh(boolean flag) throws IOException {
			if(flag){
				System.out.println("*****Refresh true");
				
			}
		}
	}
}
