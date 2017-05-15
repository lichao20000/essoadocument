package cn.flying.rest.service.utils;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 动态添加任务的线程池（限制队列容量）（可重复使用）
 * @author zhanglei 20130424
 *
 */
public class DynamicTaskExecutor {
	private Map<String,Worker> workers = new HashMap<String,Worker>();//执行的线程
	
	public String toString(){
		StringBuilder builder = new StringBuilder();
		builder.append("capacity:" + items.length);
		builder.append(" count:" + count);
		builder.append(" corePoolSize:" + workers.size());
		builder.append(" workder:" + workers.toString());
		return builder.toString();
	}
	
	public DynamicTaskExecutor(int corePoolSize) {
		this(corePoolSize, corePoolSize);
	}
	
	public DynamicTaskExecutor(int corePoolSize, int capacityQueue) {
		if(corePoolSize <= 0) throw new RuntimeException("corePoolSize should be greater than 0");
		//new ArrayBlockingQueue<Runnable>(1);
		if (capacityQueue <= 0) throw new IllegalArgumentException();
        this.items = new Runnable[capacityQueue];
        this.lock = new ReentrantLock(false);
        this.notEmpty = lock.newCondition();
        this.notFull =  lock.newCondition();
        this.completed = lock.newCondition();
        
		try {
			for (int i = 0; i < corePoolSize; i++) {
				Worker worker = new Worker();
	        	worker.setDaemon(true);
	        	workers.put(worker.workerId, worker);
	        	worker.start();
			}
		} catch (Exception e) {
			this.shutdown();
			throw new RuntimeException(e.getMessage());
		}
	}
	
	/**
	 * 添加任务（等待队列可用的空间）
	 * @param task
	 * @throws InterruptedException
	 */
	public void execute(Runnable task) throws InterruptedException{
		this.put(task);
	}
	
	/**
	 * 清空任务队列
	 */
	public void clearTask(){
		this.clear();
	}
	
	/**
	 * 等待任务完成（添加任务之后调用）
	 * @throws InterruptedException 
	 */
	public void waitComplete() throws InterruptedException {
		final ReentrantLock lock = this.lock;
		lock.lock();
        try {
    		while(count > 0){
    			completed.await();
    		}
        	Iterator<Map.Entry<String, Worker>> iter = workers.entrySet().iterator();
    		while(iter.hasNext()){
    			Worker worker = iter.next().getValue();
        		while(worker.running){//每次唤醒需验证是否对应的worker
        			completed.await();
        		}
    		}
        } finally {
        	lock.unlock();
        }	
	}
	
	/**
	 * 关闭线程池
	 */
	public void shutdown() {
		//不能使用this.lock
		Iterator<Map.Entry<String, Worker>> iter = workers.entrySet().iterator();
		while(iter.hasNext()) {
			Worker worker = iter.next().getValue();
			if(worker.isAlive()) {
				try {
					worker.interrupt();
					worker.join();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		workers.clear();
	}
	
	private final class Worker extends Thread {
		private String workerId;
		private boolean running = true;//值变更代码已同步
		public Worker(){//自定ID
			this.workerId = java.util.UUID.randomUUID().toString();
		}
		@Override
		public void run() {
			try {
				while(true) {
					Runnable task = take(this);
					try {
						task.run();
		            } catch (Exception e) {
		            	e.printStackTrace();
		            }
				}
			} catch (InterruptedException e) {
				System.out.println("^^^^^^^^^worker stopped");
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}


	/** The queued items  */
    private final Runnable[] items;
    /** items index for next take, poll or remove */
    private int takeIndex;
    /** items index for next put, offer, or add. */
    private int putIndex;
    /** Number of items in the queue */
    private int count;
    
    /** Main lock guarding all access */
    private final ReentrantLock lock;
    /** Condition for waiting takes */
    private final Condition notEmpty;
    /** Condition for waiting puts */
    private final Condition notFull;
    
    private final Condition completed;
	
    protected int size() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
    
    protected void clear() {
        final Runnable[] items = this.items;
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            int i = takeIndex;
            int k = count;
            while (k-- > 0) {
                items[i] = null;
                i = inc(i);
            }
            count = 0;
            putIndex = 0;
            takeIndex = 0;
            notFull.signalAll();
        } finally {
            lock.unlock();
        }
    }
    
    protected void put(Runnable e) throws InterruptedException {
		if (e == null)
			throw new NullPointerException();
		final Runnable[] items = this.items;
		final ReentrantLock lock = this.lock;
		lock.lockInterruptibly();
		try {
			try {
				while (count == items.length) {
					notFull.await();
				}
			} catch (InterruptedException ie) {
				notFull.signal(); // propagate to non-interrupted thread
				throw ie;
			}
			insert(e);
		} finally {
			lock.unlock();
		}
	}
	
	/**
     * Circularly increment i.
     */
    final int inc(int i) {
        return (++i == items.length)? 0 : i;
    }

    /**
     * Inserts element at current put position, advances, and signals.
     * Call only when holding lock.
     */
    private void insert(Runnable x) {
        items[putIndex] = x;
        putIndex = inc(putIndex);
        ++count;
        notEmpty.signal();
    }
	
    /**
     * Extracts element at current take position, advances, and signals.
     * Call only when holding lock.
     */
    private Runnable extract() {
        final Runnable[] items = this.items;
        Runnable x = items[takeIndex];
        items[takeIndex] = null;
        takeIndex = inc(takeIndex);
        --count;
        notFull.signal();
        return x;
    }
    
    protected Runnable take(Worker worker) throws InterruptedException {
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            try {
                while (count == 0) {
                	worker.running = false;
                	completed.signal();
                	notEmpty.await();
                	worker.running = true;
                }
            } catch (InterruptedException ie) {
                notEmpty.signal(); // propagate to non-interrupted thread
                throw ie;
            }
            return extract();
        } finally {
            lock.unlock();
        }
    }
	
}
