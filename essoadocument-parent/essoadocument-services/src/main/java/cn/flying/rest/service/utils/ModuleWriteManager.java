package cn.flying.rest.service.utils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.TrackingIndexWriter;
import org.apache.lucene.search.Query;
import org.apache.poi.hssf.record.IndexRecord;


/**
 * 索引单元写入（省份）
 * @author zhanglei 20131120
 *
 */
public class ModuleWriteManager {
	private IndexWriter indexWriter;
	private TrackingIndexWriter trackingIndexWriter;
	private List<IndexRecord> indexRecords = new ArrayList<IndexRecord>();//索引变更记录，批量提交
	private ModuleSearchManager searchManager;
	
	protected ModuleWriteManager(IndexWriter indexWriter) {
		this.indexWriter = indexWriter;
		this.trackingIndexWriter = new TrackingIndexWriter(indexWriter);;
	}

	protected IndexWriter getIndexWriter() {
		return indexWriter;
	}

	protected TrackingIndexWriter getTrackingIndexWriter() {
		return trackingIndexWriter;
	}
	
	protected ModuleSearchManager getSearchManager() {
		return searchManager;
	}

	protected void setSearchManager(ModuleSearchManager searchManager) {
		this.searchManager = searchManager;
	}

	protected void close(){
		try {
			if(indexWriter != null) indexWriter.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	/**
	 * 合并优化
	 */
	protected void meger() throws Exception{
		indexWriter.maybeMerge();
		System.out.println("***meger***");
	}
	
	
	
	
	/**
	 * 关闭索引库，用来删除索引库的时候使用
	 * @throws Exception
	 */
	public void closeWriter() throws Exception{
//	  try{
//	    indexWriter.close();
//	  }catch (Exception e) {
//	    e.printStackTrace();
//      }
	  this.close();
      System.out.println("***close***");
    }
	
	public void optimize() throws Exception{
	  if(indexWriter!=null){
	    indexWriter.forceMerge(1);
	  }
	  System.out.println("***optimize***");
	}
	
}
