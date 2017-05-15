package cn.flying.rest.service.utils;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;


/**
 * 线程池的管理类.
 * <p>通过静态方法获得此类的实例.<br>
 * <p>建议使用spring配置.<br>
 */
public class ThreadPoolManager<T> {
	/**
	 * 执行已经提交的runnable任务的对象.
	 */
	private ExecutorService service = null;
	/**
	 * 一个计数信号量.
	 */
	private final Semaphore semp ;  
	/**
	 * 存放表示异步计算结果的线程池.
	 */
	private final ThreadLocal<Future> local = new ThreadLocal<Future>();
	/**
	 * 默认构造30个线程. 将近4-5个人检索并发.
	 */
	private int maxNum	= 30;//default 30 默认构造30个线程. 将近4-5个人检索并发
	/**
	 * ThreadPoolManager类的私有的成员变量.
	 */
	private static ThreadPoolManager me = null;
	/**
	 * 静态的方法用于获取ThreadPoolManager的实例.
	 * @return ThreadPoolManager 返回线程池的管理类的实例.
	 */
	public static ThreadPoolManager getInstance(){
		if(me == null){
			me = new ThreadPoolManager();
		}
		return me;
	}
	/**
	 * 静态的方法用户获取ThreadPoolManager含有参数的实例.
	 * @param maxNum 线程的最大数量.
	 * @return ThreadPoolManager 返回ThreadPoolManager的实例.
	 */
	public static ThreadPoolManager getInstance(int maxNum){
		if(me == null){
			me = new ThreadPoolManager(maxNum);
		}
		return me;
	}
	/**
	 * 私有的构造方法.
	 */
	private ThreadPoolManager(){
		service = Executors.newCachedThreadPool();
		semp = new Semaphore(maxNum);
	}
	/**
	 * 含有线程数量的私有的构造方法.
	 * @param maxNum 线程的最大数量.
	 */
	private ThreadPoolManager(int maxNum){
		this.maxNum = maxNum;
		service = Executors.newCachedThreadPool();
		semp = new Semaphore(maxNum);
	}
	/**
	 * 执行线程任务,返回结果.
	 * <p>如果线程池数量全部占用,则此线程阻塞.<br>
	 * <p>线程运行的传入参数类的实现方法.<br>
	 * @param task  实现java.util.concurrent.Callable接口的类
	 * @return Future<T> 返回线程运行的结果.
	 * @throws InterruptedException
	 * @throws ExecutionException
	 */
	public Future<T> runTask(Callable task) throws InterruptedException, ExecutionException{
		semp.acquire();
		Future<T> f = service.submit(task);
		return f;
//		semp.release();
//		return f.get();
	}
	/**
	 * 自动释放线程池资源.
	 * @param task 线程已启动但未运行的一个接口.
	 * @return Future<T> 返回异步计算的结果.
	 */
	public Future<T> runTaskforFree(Callable task) throws InterruptedException, ExecutionException{
		semp.acquire();
		Future<T> f = service.submit(task);
		semp.release();
		return f;
	}
	/**
	 * 获得异步计算的结果.
	 * @param future 异步计算的结果.
	 * @return T 返回异步计算的结果.
	 * @throws InterruptedException
	 * @throws ExecutionException
	 */
	public T getResult(Future<T> future) throws InterruptedException, ExecutionException{
		semp.release();
		return future.get();
	}
	
	/**
	 * 获得可用的线程数量.
	 * @return int 返回线程可用数量.
	 */
	public synchronized int getavailableNum(){
		return this.semp.availablePermits();
	}
	
	/**
	 * 关闭线程池.
	 */
	public synchronized void close(){
		if(this.service == null)return;
		service.shutdown();
		me = null;
	}
	
	/**
	 * 设置线程池中的线程数.
	 * <p>这里先销毁现有的线程池,然后重新创建.<br>
	 * @param number 线程池里面的的线程数,必须大于0.
	 * @author dongchang 2009-09-24
	 */
	public synchronized void setPoolNumber(int number){
		if(number < 0)return ;
		if(number == this.maxNum)return;
		if(me != null){
			this.close();
		}
		me = new ThreadPoolManager(number);
	}
	
	public static void main(String[] args)throws Exception {
		ThreadPoolManager<String> m = ThreadPoolManager.getInstance();
		
		class R implements Callable<String>{
			String name = "";
			R(String name){
				this.name = name;
			}
			public String call() throws Exception{
				Thread.sleep((long) (Math.random() * 1000));
				return "线程"+name+"运行...";
			}
		}
		
		for (int i = 0; i < 10; i++) {
			System.out.println(m.runTask(new R(i+"")));
		}
		m.close();
	}
}
