package cn.flying.rest.service.utils;

import java.io.IOException;
import java.util.HashMap;

import org.apache.lucene.index.AtomicReaderContext;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.Scorer;
import org.apache.lucene.search.TopScoreDocCollector;
import org.apache.lucene.search.Weight;
import org.apache.lucene.store.FSDirectory;

/***
 * @author xiaoxiong 20140717
 * 重载IndexSearcher，为了实现跨库不同数据权限检索；
 * 并对检索的逻辑进行简化与检索次数的检索，使其一次检索即可支持分页查询，从而提高性能
 */
public class MyIndexSearcher extends IndexSearcher {

	/**
	 * 默认构造函数，直接调用IndexSearcher
	 * @param r
	 */
	public MyIndexSearcher(IndexReader r) {
		super(r);
	}
	
	/**
	 * 跨库不同数据权限检索（非admin用户走权限，所以各个索引库走不同的检索条件，即调用此方法）
	 * @param querys
	 * @param collector
	 * @throws IOException
	 */
	public void search(HashMap<String, Query> querys, TopScoreDocCollector collector) throws IOException {
		// TODO: should we make this
		// threaded...?  the Collector could be sync'd?
		// always use single thread:
		for (AtomicReaderContext ctx : this.leafContexts) { // search each subreader
			collector.setNextReader(ctx);
			System.out.println(querys.get(((FSDirectory)((DirectoryReader)ctx.parent.reader()).directory()).getDirectory().getPath()));
			Scorer scorer = createNormalizedWeight(querys.get(((FSDirectory)((DirectoryReader)ctx.parent.reader()).directory()).getDirectory().getPath())).scorer(ctx, !collector.acceptsDocsOutOfOrder(), true, ctx.reader().getLiveDocs());
			if (scorer != null) {
			    scorer.score(collector);
			}
		}
	}
	
	/**
	 * 跨库相同数据权限检索（admin用户不走权限，所以各个索引库都走一个检索条件，即调用此方法）
	 * @param query
	 * @param collector
	 * @throws IOException
	 */
	public void search(Query query, TopScoreDocCollector collector) throws IOException {
		// TODO: should we make this
		// threaded...?  the Collector could be sync'd?
		// always use single thread:
		Weight weight = createNormalizedWeight(query) ;
		for (AtomicReaderContext ctx : this.leafContexts) { // search each subreader
			collector.setNextReader(ctx);
			Scorer scorer = weight.scorer(ctx, !collector.acceptsDocsOutOfOrder(), true, ctx.reader().getLiveDocs());
			if (scorer != null) {
				scorer.score(collector);
			}
		}
	}

}
