package cn.flying.rest.service.utils;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class HttpSimulator {
	private static final String CHAR_ENCODING = "UTF-8";
	/**
	 * 按HTTP协议发送请求(转发文件)
	 * @author zhanglei 20130221
	 * @param urlString
	 * @param request UTF-8
	 * @return
	 */
	public static String executeUpload(String urlString, HttpServletRequest request) {
		HttpURLConnection connection = null;
		try {
			//建立连接
			URL url = new URL(urlString);
			connection = (HttpURLConnection) url.openConnection();
			//connection.setFixedLengthStreamingMode(request.getContentLength());//输出流的固定长度，输出流不缓存
			connection.setChunkedStreamingMode(10240);//缓存块的大小
			connection.setDoOutput(true);
			connection.setDoInput(true);
			connection.setRequestMethod("POST");
			connection.setRequestProperty("Content-Type", request.getContentType());
			connection.setRequestProperty("Content-Length", String.valueOf(request.getContentLength()));
			//connection.setUseCaches(false);
			connection.connect();

			//发送数据
			DataOutputStream out = new DataOutputStream(connection.getOutputStream());
			InputStream is = request.getInputStream();
			byte[] by = new byte[1024];
			int len = 0;
			while((len = is.read(by)) > 0){
				out.write(by, 0, len);
			}
			out.flush();
			is.close();
			out.close();
			
			//返回数据
			BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), CHAR_ENCODING));
			StringBuffer buffer = new StringBuffer();
			String line = null;
			while ((line = reader.readLine()) != null) {
				buffer.append(line);
			}
			reader.close();
			return buffer.toString();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if(connection != null) connection.disconnect();
		}
		return null;
	}
	
	/**
	 * 按HTTP协议发送请求(下载文件)
	 * @author zhanglei 20130225
	 * @param urlString
	 * @param destFile
	 * @return
	 */
	public static boolean executeDownload(String urlString, String destFile) {
		HttpURLConnection connection = null;
		FileOutputStream fos = null;
		try {
			//建立连接
			URL url = new URL(urlString);
			connection = (HttpURLConnection) url.openConnection();
			connection.setDoOutput(false);
			connection.setDoInput(true);
			connection.setRequestMethod("GET");
			//connection.setUseCaches(false);
			connection.connect();
			
			//返回数据
			InputStream is = connection.getInputStream();
			fos = new FileOutputStream(destFile);
			byte[] by = new byte[1024];
			int len = 0;
			while((len = is.read(by)) > 0){
				fos.write(by, 0, len);
			}
			is.close();
			return true;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if(fos != null) fos.close();
			} catch (Exception e) {
				e.printStackTrace();
			} finally {
				if(connection != null) connection.disconnect();
			}
		}
		return false;
	}
	
	/**
	 * 按HTTP协议发送请求(上传文件，传参使用byte[]时文件不能过大)
	 * @author zhanglei 20130225
	 * @param urlString
	 * @param paramMap 字段参数 key为"name"
	 * @param fileMap 文件，key为"name"和"fileName"和"file"，"file"值类型为byte[]或String
	 * @return
	 */
	public static String executeUpload(String urlString, Map<String, String> paramMap, Map<String, Object> fileMap) {
		HttpURLConnection connection = null;
		try {
			//数据体分隔符
			String boundary = "------------------------" + java.util.UUID.randomUUID().toString().replaceAll("-", "");
			
			StringBuffer sb = new StringBuffer();
			//发送字段
			for (Iterator<Map.Entry<String, String>> it = paramMap.entrySet().iterator(); it.hasNext();) {
				Map.Entry<String, String> entry = it.next();
				sb.append("--");
				sb.append(boundary);
				sb.append("\r\n");
				sb.append("Content-Disposition: form-data; name=\"" + entry.getKey() + "\"\r\n\r\n");
				sb.append(entry.getValue());
				sb.append("\r\n");
			}
			//发送文件
			sb.append("--");
			sb.append(boundary);
			sb.append("\r\n");
			sb.append("Content-Disposition: form-data; name=\"" + (String)fileMap.get("name") + "\"; filename=\"" + (String)fileMap.get("fileName") + "\"\r\n");
			sb.append("Content-Type: application/octet-stream\r\n\r\n");
			byte[] data = sb.toString().getBytes(CHAR_ENCODING);
			File file = null;
			byte[] fileData = null;
			long fileSize = 0L;
			Object obj = fileMap.get("file");
			if(obj instanceof String){
				file = new File((String)obj);
				fileSize = file.length();
			}else if(obj instanceof byte[]){
				fileData = (byte[])obj;
				fileSize = fileData.length;
			}
			byte[] endData = ("\r\n--" + boundary + "--\r\n").getBytes(CHAR_ENCODING);
			//建立连接
			URL url = new URL(urlString);
			connection = (HttpURLConnection) url.openConnection();
			//connection.setFixedLengthStreamingMode(request.getContentLength());//输出流的固定长度，输出流不缓存
			connection.setChunkedStreamingMode(10240);//缓存块的大小
			connection.setDoOutput(true);
			connection.setDoInput(true);
			connection.setRequestMethod("POST");
			connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
			connection.setRequestProperty("Content-Length", String.valueOf(data.length + fileSize + endData.length));
			//connection.setUseCaches(false);
			connection.connect();
			
			//发送数据
			DataOutputStream out = new DataOutputStream(connection.getOutputStream());
			out.write(data);
			if(file != null){
				InputStream is = new FileInputStream(file);
				byte[] by = new byte[1024];
				int len = 0;
				while((len = is.read(by)) > 0){
					out.write(by, 0, len);
				}
			}else if(fileData != null){
				out.write(fileData);
			}
			out.write(endData);
			out.flush();
			out.close();
			
			//返回数据
			BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), CHAR_ENCODING));
			StringBuffer buffer = new StringBuffer();
			String line = null;
			while ((line = reader.readLine()) != null) {
				buffer.append(line);
			}
			reader.close();
			return buffer.toString();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if(connection != null) connection.disconnect();
		}
		return null;
	}
	
	/**
	 * 按HTTP协议发送请求(下载文件，文件不能过大)
	 * @author zhanglei 20130225
	 * @param urlString
	 * @return
	 */
	public static byte[] executeDownload(String urlString) {
		HttpURLConnection connection = null;
		try {
			//建立连接
			URL url = new URL(urlString);
			connection = (HttpURLConnection) url.openConnection();
			connection.setDoOutput(false);
			connection.setDoInput(true);
			connection.setRequestMethod("GET");
			//connection.setUseCaches(false);
			connection.connect();
			
			//返回数据
			ByteBuffer byteBuffer = ByteBuffer.allocate(connection.getContentLength());
			InputStream is = connection.getInputStream();
			byte[] by = new byte[1024];
			int len = 0;
			while((len = is.read(by)) > 0){
				byteBuffer.put(by, 0, len);
			}
			is.close();
			return byteBuffer.array();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if(connection != null) connection.disconnect();
		}
		return null;
	}
	
}
