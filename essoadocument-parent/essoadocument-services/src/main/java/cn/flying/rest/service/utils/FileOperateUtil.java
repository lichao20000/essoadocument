package cn.flying.rest.service.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.tools.ant.Project;
import org.apache.tools.ant.taskdefs.Copy;

/**
 * 文件操作工具类
 * 
 * @author administrator yang 2007-03-19
 */
public class FileOperateUtil {

  /**
   * 以文件流的方式复制文件
   * 
   * @param src 文件源
   * @param dest 文件目的目录
   * @throws IOException
   */
  public static void copyFile(String src, String dest) throws IOException {
    FileInputStream in = new FileInputStream(src);
    File file = new File(dest);
    if (!file.exists())
      file.createNewFile();
    FileOutputStream out = new FileOutputStream(file);
    int c;
    byte buffer[] = new byte[1024];
    while ((c = in.read(buffer)) != -1) {
      for (int i = 0; i < c; i++)
        out.write(buffer[i]);
    }
    in.close();
    out.close();
  }

  /**
   * 通过apache工具包把一个文件复制到指定的目录下
   * 
   * @param src 被复制的文件
   * @param destDir 指定的目录
   * @author ninglong 20111009
   */
  public static void copyFileToDir(File src, File destDir) {
    Project project = new Project();
    Copy copy = new Copy();
    copy.setProject(project);
    copy.setFile(src);
    copy.setTodir(destDir);
    copy.execute();
  }

  /**
   * 创建目录
   * 
   * @param folderPath 目录路径
   * @return ture 成功 false 失败
   * @throws IOException
   */
  public static boolean createFolder(String folderPath) throws IOException {
    boolean result = false;
    File f = new File(folderPath);
    result = f.mkdirs();
    return result;
  }

  /**
   * 删除目录下所有文件 只删除指定路径下的所有文件,不删除路径
   * 
   * @param directory (File 对象)
   * 
   */
  public static void deleteDirectory(File directory) {
    File[] entries = directory.listFiles();
    for (int i = 0; i < entries.length; i++) {
      entries[i].delete();
    }
  }

  /**
   * 此方法将txt文本的内容全部转换成String
   * 
   * @param FileName 将转换的文件名
   * @param charset 编码格式
   * @return 文件内容
   * @throws IOException
   */
  public static final String FileReaderAll(String FileName, String charset) {
    try {
      BufferedReader reader =
          new BufferedReader(new InputStreamReader(new FileInputStream(FileName), charset));
      String line = new String();
      String temp = new String();

      while ((line = reader.readLine()) != null) {
        temp += line;
      }
      reader.close();
      return temp;
    } catch (Exception ex) {
      return "";
    }
  }

  /**
   * 删除文件
   * 
   * @param filepath 文件所在物理路径
   * @return 是否删除成功
   */
  public static boolean isDel(String filepath) {
    boolean result = false;
    File file = new File(filepath);
    result = file.delete();
    file = null;
    return result;
  }

  /**
   * 日志备份
   * 
   * @param filePath 日志备份路径
   * @param baksize 日志备份大小参考值(字节大小)
   * @throws IOException
   */
  public static void logBak(String filePath, long baksize) throws IOException {
    File f = new File(filePath);
    long len = f.length();
    SimpleDateFormat simpledateformat = new SimpleDateFormat("yyyyMMddHHmmss");
    String s = simpledateformat.format(new Date());
    String fileName = f.getName();
    int dot = fileName.indexOf(".");
    String bakName = s + fileName.substring(dot);
    System.out.println(bakName);
    if (len >= baksize) {
      renamefile(filePath, bakName);
      makeFile(filePath);
    }
    f = null;
  }

  /**
   * 创建文件
   * 
   * @param filepath 文件所在目录路径,比如:c:/test/test.txt
   * @return 是否创建成功
   */
  public static boolean makeFile(String filepath) throws IOException {
    boolean result = false;
    File file = new File(filepath);
    result = file.createNewFile();
    file = null;
    return result;
  }

  /**
   * 文件重命名
   * 
   * @param filepath 文件所在物理路径
   * @param destname 新文件名
   * @return 重命名是否成功
   */
  public static boolean renamefile(String filepath, String destname) {
    boolean result = false;
    File f = new File(filepath);
    String fileParent = f.getParent();
    File rf = new File(fileParent + "//" + destname);
    if (f.renameTo(rf)) {
      result = true;
    }
    f = null;
    rf = null;
    return result;
  }

  /**
   * 将文件内容输出
   * 
   * @param content 输出文件的内容
   * @param filePathName 文件名字
   */
  public static void writeTextFile(String content, String filePathName) {
    try {
      OutputStreamWriter output =
          new OutputStreamWriter(new FileOutputStream(filePathName), "utf-8");
      // 输出text文件
      output.write(content);
      output.flush();
      output.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
