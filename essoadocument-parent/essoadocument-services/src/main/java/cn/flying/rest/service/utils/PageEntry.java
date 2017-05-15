package cn.flying.rest.service.utils;

/**
 * 分页参数
 * @author zhanglei 20131028
 *
 */
public class PageEntry implements java.io.Serializable{
	private static final long serialVersionUID = 6253383865174479222L;
	
	private int start;//每页起始位置
	private int limit;//每页数量
	private SortBy sortBy;//排序
	private ScoreDoc afterDoc;
	
	public static class SortBy {
		public String sort;//排序字段
		public boolean numerical;//是否按数字排序
		public boolean reverse;//倒序true 正序false
		public SortBy(String sort, boolean numerical, boolean reverse) {
			this.sort = sort;
			this.numerical = numerical;
			this.reverse = reverse;
		}
	}
	
	public static class ScoreDoc {
		public int doc;
		public float score;
		public ScoreDoc(int doc, float score) {
			this.doc = doc;
			this.score = score;
		}
		public String toString() {
			return new StringBuilder().append("doc=").append(doc).append(" score=").append(score).toString();
		}
	}
	public int getStart() {
		return start;
	}
	public void setStart(int start) {
		this.start = start;
	}
	public int getLimit() {
		return limit;
	}
	public void setLimit(int limit) {
		this.limit = limit;
	}
	public SortBy getSortBy() {
		return sortBy;
	}
	public void setSortBy(SortBy sortBy) {
		this.sortBy = sortBy;
	}
	public ScoreDoc getAfterDoc() {
		return afterDoc;
	}
	public void setAfterDoc(ScoreDoc afterDoc) {
		this.afterDoc = afterDoc;
	}
}
