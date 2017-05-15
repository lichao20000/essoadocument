package cn.flying.rest.service.utils;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.mozilla.universalchardet.UniversalDetector;

public class FileUtilForEdge {
	
	//zhanglei 20130420
	public static File[] getFileList(String path) {
		return new File(path).listFiles(new FileFilter(){
			@Override
			public boolean accept(File pathname) {
				if(pathname.isFile()){
					return true;
				}
				return false;
			}
		});
	}
	
	/**
	 * 获取指定后缀指定日期时间之前的文件
	 * @author zhanglei 20130802
	 * @param path
	 * @param suffix
	 * @param allowTime
	 * @return
	 */
	public static File[] getFileList(String path, final String suffix, Date allowTime){
		final Date allow = new Date(allowTime.getTime());
		return new File(path).listFiles(new FileFilter(){
			@Override
			public boolean accept(File file) {
				if(file.isFile() && file.getName().endsWith(suffix) && new Date(file.lastModified()).before(allow)){
					return true;
				}
				return false;
			}
		});
	}
	
	/**
	 * 获取指定后缀的文件
	 * @author zhanglei 20130926
	 * @param path
	 * @param suffix
	 * @return
	 */
	public static File[] getFileListSuffix(String path, final String suffix){
		return new File(path).listFiles(new FileFilter(){
			@Override
			public boolean accept(File pathname) {
				if(pathname.isFile() && pathname.getName().endsWith(suffix)){
					return true;
				}
				return false;
			}
		});
	}
	
	/**
	 * 获取排除指定后缀的文件
	 * @author zhanglei 20130926
	 * @param path
	 * @param escapeSuffix
	 * @return
	 */
	public static File[] getFileListEscapeSuffix(String path, final String escapeSuffix){
		return new File(path).listFiles(new FileFilter(){
			@Override
			public boolean accept(File pathname) {
				if(pathname.isFile() && !pathname.getName().endsWith(escapeSuffix)){
					return true;
				}
				return false;
			}
		});
	}
	
	//zhanglei 20130420
	public static List<String> getFileNameList(String path) {
		List<String> list = new ArrayList<String>();
		File file = new File(path);
		File[] files = file.listFiles();
		for (int i = 0; i < files.length; i++) {
			list.add(files[i].getName());
		}
		return list;
	}
	//zhanglei 20130420
	public static String checkPath(String sysPath){
		if(sysPath != null && !"".equals(sysPath = sysPath.trim())){
			sysPath = sysPath.replaceAll("\\\\", "/");
			if(!sysPath.endsWith("/")) sysPath += "/";
			return sysPath;
		}
		return "";
	}
	
	/**
	 * 拷贝文件
	 * @author zhanglei 20130420
	 * @param source
	 * @param target
	 * @return
	 */
	public static boolean copyFile(String source, String target){
		InputStream inStream = null;
		OutputStream outStream = null;
		try {
			inStream = new BufferedInputStream(new FileInputStream(source));
			outStream = new BufferedOutputStream(new FileOutputStream(target));
			byte[] buf = new byte[1024];
			int n = 0;
			while ((n = inStream.read(buf)) != -1) {
				outStream.write(buf, 0, n);
			}
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		} finally {
			try {
				if (inStream != null) inStream.close();
				if (outStream != null) outStream.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	public static boolean deleteFile(String delpath) {
		try {
			File file = new File(delpath);
			if (!file.isDirectory()) {
				if (file.canWrite()) {
					file.delete();
				}
			} else if (file.isDirectory()) {
				String[] filelist = file.list();
				for (int i = 0; i < filelist.length; i++) {
					File delfile = new File(delpath + "/" + filelist[i]);
					if (!delfile.isDirectory())
						if (delfile.canWrite()) {
							delfile.delete();
						} else if (delfile.isDirectory()) {
							if (delfile.canWrite()) {
								deleteFile(delpath + "/" + filelist[i]);
							}
						}
				}
				file.delete();
			}
		} catch (Exception e) {
			return false;
		}
		return true;
	}
	
	public static boolean removeFile(String source, String target){
		if(!copyFile(source, target)){
			return false;
		}
		return new File(source).delete();
	}
	
	//探测文件编码
	public static String getCharset(String fileName) {
		InputStream inStream = null;
		try {
			byte[] buf = new byte[4096];
			inStream = new BufferedInputStream(new FileInputStream(fileName));
			// (1)
			UniversalDetector detector = new UniversalDetector(null);
			// (2)
			int nread;
			while ((nread = inStream.read(buf)) > 0 && !detector.isDone()) {
				detector.handleData(buf, 0, nread);
			}
			// (3)
			detector.dataEnd();
			// (4)
			String encoding = detector.getDetectedCharset();
			// (5)
			detector.reset();
			
			return encoding;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if(inStream != null){
				try {
					inStream.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		return null;
	}
	
	private static final char[] hexDigits = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' };
	
	private static final String charEncoding_from = Charset.defaultCharset().name();
	private static final String charEncoding_to = Charset.forName("UTF-8").name();
	/**
	 * 获取字符串MD5
	 * @author zhanglei 20130925
	 * @param sourceStr
	 * @return
	 */
	public static String getStrMD5(String sourceStr) {
		try {
			MessageDigest messageDigest = MessageDigest.getInstance("MD5");
			if(charEncoding_from.equals(charEncoding_to)){
				messageDigest.update(sourceStr.getBytes());
			}else{
				messageDigest.update(new String(sourceStr.getBytes(), charEncoding_to).getBytes(charEncoding_to));
			}
			byte[] byteArray = messageDigest.digest();
			//1个byte是八位二进制，也就是2位十六进制字符（2的8次方等于16的2次方）
			char[] charArray = new char[byteArray.length * 2];
			int index = 0;
			for (byte b : byteArray) {
				charArray[index++] = hexDigits[b >>> 4 & 0xf];
				charArray[index++] = hexDigits[b & 0xf];
			}
			return new String(charArray).toLowerCase();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * 获取文件MD5
	 * @author zhanglei 20130925
	 * @param file
	 * @return
	 */
	public static String getFileMD5(File file) {
		InputStream inStream = null;
		try {
			inStream = new BufferedInputStream(new FileInputStream(file));
			MessageDigest messageDigest = MessageDigest.getInstance("MD5");
			byte[] buffer = new byte[1024];
			int length = -1;
			while ((length = inStream.read(buffer)) != -1) {
				messageDigest.update(buffer, 0, length);
			}
			
			byte[] byteArray = messageDigest.digest();
			//1个byte是八位二进制，也就是2位十六进制字符（2的8次方等于16的2次方）
			char[] charArray = new char[byteArray.length * 2];
			int index = 0;
			for (byte b : byteArray) {
				charArray[index++] = hexDigits[b >>> 4 & 0xf];
				charArray[index++] = hexDigits[b & 0xf];
			}
			return new String(charArray).toLowerCase();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if(inStream != null) inStream.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return null;
	}
	
	/**
	 * 合并文件
	 * @param sourceList
	 * @param target
	 * @return
	 */
	public static boolean mergeFile(List<String> sourceList, String target){
		OutputStream outStream = null;
		try {
			outStream = new BufferedOutputStream(new FileOutputStream(target));
			byte[] buf = new byte[1024];
			for(String source : sourceList){
				InputStream inStream = null;
				try {
					inStream = new BufferedInputStream(new FileInputStream(source));
					int n = 0;
					while ((n = inStream.read(buf)) != -1) {
						outStream.write(buf, 0, n);
					}
					outStream.write(System.getProperty("line.separator").getBytes());
				} finally {
					if (inStream != null) inStream.close();
				}
			}
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		} finally {
			try {
				if (outStream != null) outStream.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	public static void main(String[] args){
		//String charset = getCharset("D:\\flyingsoft\\receive\\oradata\\bjoa\\success\\2013-09\\2013-09-26\\P-BJOA_201300110000766115058c49fcbd978a8f3ac1fc3e666fe0.xml");//eippack.uploadinf
		//String charset = getCharset("D:\\data\\P-BJOA_20120011007460514faffd38d79f2887f4af1ca08acf9ab2.eippack.uploadinf");
		//String charset = getCharset("C:/test/2013-10-24.log");
		//System.out.println(charset);
		
		File f = new File("D:\\data\\test.txt");
		String md5 = getFileMD5(f);
		System.out.println(md5);
		
		System.out.println("&&&");
	}
}
