package cn.flying.rest.service.utils;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;

/**
 * @see 多个文件打成一个压缩包 1.为导出案卷数据时，卷内数据也同时导出 2.当数据量过大时，写入多个文件，最后打包
 * @author yanggaofei 20121220
 * 
 */
public class PackageZip {
  /**
   * 
   * @param strFiles 要压缩的文件的集合
   * @param path 压缩文件所在服务器的地址
   * @param zipname 压缩文件的名称
   * @return 压缩文件名 异常为null
   */
  public static String writeZip(List<String> strFiles, String path, String baseZipName) {
    String zipName = baseZipName + ".zip";
    try {
        OutputStream os = new BufferedOutputStream(new FileOutputStream(path + zipName));
        ZipOutputStream zos = new ZipOutputStream(os);
        zos.setEncoding("UTF-8");
        byte[] buf = new byte[8192];
        int len;
        for (int i = 0; i < strFiles.size(); i++) {
            File file = new File(strFiles.get(i));
            if (!file.isFile())
                continue;
            ZipEntry ze = new ZipEntry(file.getName());
            zos.putNextEntry(ze);
            BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
            while ((len = bis.read(buf)) > 0) {
                zos.write(buf, 0, len);
            }
            zos.setEncoding("UTF-8"); //设置编码格式
            zos.closeEntry();
            bis.close();
        }
        zos.closeEntry();
        zos.close();
        os.close();
        System.out.println("压缩完成:" + zipName);
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    } finally {
        for (int i = 0; i < strFiles.size(); i++) {
            File file = new File(strFiles.get(i));
            file.delete();
        }
    }
    return zipName;
}

  /** wanghongchen 20140808 压缩文件文件夹 start **/
  public static void zip(String inputFileName, String zipFileName) {
    File f = new File(inputFileName);
    zip(zipFileName, f);
    deleteFolder(f);
  }

  private static void zip(String zipFileName, File inputFile) {
    ZipOutputStream out;
    try {
      out = new ZipOutputStream(new FileOutputStream(zipFileName));
      zip(out, inputFile, "");
      System.out.println("zip done");
      out.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private static void zip(ZipOutputStream out, File f, String base) {
    try {
      if (f.isDirectory()) { // 判断是否为目录
        File[] fl = f.listFiles();
//        out.putNextEntry(new ZipEntry(base + "/"));
        base = base.length() == 0 ? "" : base + "/";
        for (int i = 0; i < fl.length; i++) {
          zip(out, fl[i], base + fl[i].getName());
        }
      } else { // 压缩目录中的所有文件
        out.putNextEntry(new ZipEntry(base));
        FileInputStream in = new FileInputStream(f);
        int b;
        System.out.println(base);
        while ((b = in.read()) != -1) {
          out.write(b);
        }
        in.close();
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  /** wanghongchen 20140808 压缩文件文件夹 end **/
  
  /**
   * 删除文件夹
   * wanghongchen 20140808
   * @param file
   */
  public static void deleteFolder(File file){
    if(file.isDirectory()){
      File[] fs = file.listFiles();
      for(File f : fs){
        if(f.isDirectory()){
          deleteFolder(f);
        }else{
          f.delete();
        }
      }
      file.delete();
    }else{
      file.delete();
    }
  }

  public static void main(String[] args) {

  }
}
