package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import org.jboss.resteasy.util.Base64;

/**
 * base64文件转码，暂时用于表单导入导出及工作流模版导入导出
 * @author 
 *
 */
public class Base64Util {
	public static void encode(String filePath,String writePath){
		try {
			execute(filePath,writePath,false);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static void decode(String filePath,String writePath){
		try {
			execute(filePath,writePath,true);
		} catch (Exception e) {
			e.printStackTrace();
		}	
	}
	
	private static void execute(String filePath,String writePath,boolean isDecode)throws Exception{
		InputStream inStream = null;
		OutputStream outStream = null ;
		inStream = new FileInputStream(filePath);
		outStream = new FileOutputStream(writePath);
		int filelength = (int)new File(filePath).length();
		byte[] buf = new byte[filelength];
		inStream.read(buf,0,filelength);
		byte []b ;
		if(isDecode){
			b = Base64.decode(buf);
		}else{
			b = Base64.encodeBytesToBytes(buf);
		}
		outStream.write(b);
		outStream.flush();
		outStream.close();
        inStream.close();
	}
	
}
