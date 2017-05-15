package cn.flying.rest.service.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 分页查询结果
 * @author zhanglei 20131008
 *
 * @param <T>
 */
public class PageDisplay<T> implements java.io.Serializable{
	private static final long serialVersionUID = 1709058654248266154L;
	
	private String error;//不为null则异常
	private long total;
	private List<T> list;
	
	public String getError() {
		return error;
	}
	public void setError(String error) {
		this.error = error;
	}
	public long getTotal() {
		return total;
	}
	public void setTotal(long total) {
		this.total = total;
	}
	public List<T> getList() {
		return list;
	}
	public void setList(List<T> list) {
		this.list = list;
	}
	
	/**
	 * 分页执行
	 * @param collection
	 * @param limit
	 * @param executable
	 */
	public static <E> void executeByPage(Collection<E> collection, int limit, Executable<E> executable){
		List<E> tempList = new ArrayList<E>();
		for(E element : collection){
			tempList.add(element);
			if(tempList.size() % limit == 0){
				executable.exe(tempList);
				tempList.clear();
			}
		}
		if(!tempList.isEmpty()){
			executable.exe(tempList);
		}
	}
	
	public static interface Executable<E> {
		public void exe(List<E> pageList);
	}
	
}
