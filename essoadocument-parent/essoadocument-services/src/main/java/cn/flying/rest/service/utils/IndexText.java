package cn.flying.rest.service.utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.RandomAccessFile;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 文本文件存储
 * @author zhanglei 20131111
 *
 */
public class IndexText {
	//文本文件后缀
	public static final String textSuffix = ".text";
	//无年度值
	public static final String default_year = "0000";
	
	public static final int textCachedCount;
	/**
	 * 使用时需加模块、年度、Hash路径
	 */
	public static final String textRootFolder;
	
	private static final ReentrantLock cachedLock = new ReentrantLock(false);//非公平锁
	//缓存原始文本 key:fileId
	private static final Map<String, String> cachedDocTextMap;
	
	//虚拟内存映射对象缓存
	//private static final Map<String, String> virtualMemMap
	
	static {
		textCachedCount = Integer.parseInt(PropertyConfigurer.getContextProperty("escloud.indexstore.indexText.cachedCount").trim());
		cachedDocTextMap = new LinkedSortedMap<String, String>(true, textCachedCount);//true访问顺序
		textRootFolder = FileUtilForEdge.checkPath(PropertyConfigurer.getContextProperty("escloud.indexstore.indexText.rootFolder"));
		new File(textRootFolder).mkdirs();
	}
	
	//32位guid的hash值最多10位数字分4组(1、3、3、3)，取后3组，字符串hashcode起码2位数字
	//private static final int Divisor_1 = 1000*1000*1000;
	private static final int Divisor_2 = 1000*1000;
	private static final int Divisor_3 = 1000;
	private static final int Remainder = 1000;
	
	/**
	 * 获取文件存储路径（相对根路径）
	 * @param fileId（32位guid，字母小写，数据条目path的MD5）
	 * @return
	 */
	public static String getHashPath(String fileId) throws Exception{
		int hashcode = fileId.hashCode();//-2147483648至2147483647
		//System.out.println("hashcode:" + hashcode);
		if(hashcode == 0) throw new RuntimeException();
		if(hashcode < 0) hashcode = ~hashcode;
		StringBuilder pathBuilder = new StringBuilder();
		//pathBuilder.append(hashcode / Divisor_1);
		//pathBuilder.append("/");
		pathBuilder.append(hashcode / Divisor_2 % Remainder);
		pathBuilder.append("/");
		pathBuilder.append(hashcode / Divisor_3 % Remainder);
		pathBuilder.append("/");
		pathBuilder.append(hashcode % Remainder);
		pathBuilder.append("/");
		return pathBuilder.toString();
	}
	
	/**
	 * 获取文件内容
	 * @param filePath
	 * @param fileId
	 * @return
	 */
	public static String getDocumentText(String filePath, String fileId) throws Exception{
		String text = cachedDocTextMap.get(fileId);
		if (text != null) return text;
		String file = IndexText.textRootFolder + filePath + fileId + IndexText.textSuffix;
		text = readFile(file);
		final ReentrantLock lock = cachedLock;
		lock.lockInterruptibly();
		try {
			cachedDocTextMap.put(fileId, text);
		} finally {
			lock.unlock();
		}
		return text;
	}
	
	/**
	 * 移除缓存文件
	 * @param fileId
	 */
	public static void removeCachedText(String fileId) throws Exception{
		final ReentrantLock lock = cachedLock;
		lock.lockInterruptibly();
		try {
			cachedDocTextMap.remove(fileId);
		} finally {
			lock.unlock();
		}
	}
	
	private static final int bufferSize = 4096;
	/**
	 * 读取文件内容
	 */
	protected static String readMappedFile(String file) throws Exception{
		RandomAccessFile raf = null;
		FileChannel fc = null;
		try {
			raf = new RandomAccessFile(new File(file), "r");
			fc = raf.getChannel();
			long length = fc.size();
			MappedByteBuffer buffer = fc.map(FileChannel.MapMode.READ_ONLY, 0, length);
			StringBuilder str = new StringBuilder();
			byte[] by = new byte[bufferSize];
			for(long offset = 0; offset < length; offset += bufferSize){
				if(length - offset < bufferSize){
					by = new byte[(int)(length - offset)];
				}
				buffer.get(by);
				str.append(new String(by));
			}
			return str.toString();
		} catch(Exception e) {
			throw e;
		} finally {
			try {
				if(fc != null) fc.close();
				if(raf != null) raf.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	/**
	 * 读取文件内容
	 */
	protected static String readFile(String file) throws Exception{
		Reader reader = null;
		Writer writer = null;
		try {
			reader = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
			StringWriter stringWriter = new StringWriter();
			writer = new BufferedWriter(stringWriter);
			char[] buffer = new char[1024];//字符缓冲区
			int len = 0;
			while ((len = reader.read(buffer)) > 0) {
				writer.write(buffer, 0, len);
			}
			writer.flush();
			String fileStr = stringWriter.toString();
			stringWriter.close();
			return fileStr;
		} catch (Exception e) {
			throw e;
		} finally {
			try {
				if(reader != null) reader.close();
				if(writer != null) writer.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) throws Exception{
		String id = java.util.UUID.randomUUID().toString().replace("-", "");
		//System.out.println(id);
		System.out.println(getHashPath(id));
		String t = readFile("D:/flyingsoft/test/3.txt");
		System.out.println(t);
	}
}
