package cn.flying.rest.service.utils;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipInputStream;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipFile;
import org.apache.tools.zip.ZipOutputStream;
import org.springframework.util.CollectionUtils;



/**
 * zip工具类
 * 
 * 
 */
public class ZipUtil {


  public static final String FOUR_BACKSLASH = "\\\\";

  public static final String SLASH = "/";

  public static final transient Log log = LogFactory.getLog(ZipUtil.class);

  public static final String GBK_ENCODE = "GBK";

  /**
   * <p>
   * 添加文件到已存在的zip文件或jar文件
   * </p>
   * 
   * @author wuxing
   * @version 1.0
   * @param zipFile
   * @param files
   * @throws IOException
   */
  public static void addFilesToExistingZip(File zipFile, File[] files) throws IOException {

    if (zipFile != null && zipFile.exists() && zipFile.isFile()) {
      File tempFile = null;
      java.util.zip.ZipOutputStream out = null;
      ZipInputStream zin = null;
      try {
        tempFile = File.createTempFile(zipFile.getName(), null);
        tempFile.delete();
        boolean renameOk = zipFile.renameTo(tempFile);
        if (!renameOk) {
          throw new RuntimeException("不能重命名文件: " + zipFile.getAbsolutePath() + " 为 "
              + tempFile.getAbsolutePath());
        }
        byte[] buf = new byte[1024];
        zin = new ZipInputStream(new FileInputStream(tempFile));
        out = new java.util.zip.ZipOutputStream(new FileOutputStream(zipFile));
        java.util.zip.ZipEntry entry = zin.getNextEntry();
        while (entry != null) {
          String name = entry.getName();
          boolean notInFiles = true;
          for (File f : files) {
            if (f.getName().equals(name)) {
              notInFiles = false;
              break;
            }
          }
          if (notInFiles) {
            out.putNextEntry(new ZipEntry(name));
            int len;
            while ((len = zin.read(buf)) > 0) {
              out.write(buf, 0, len);
            }
          }
          entry = zin.getNextEntry();
        }
        zin.close();
        for (int i = 0; i < files.length; i++) {
          InputStream in = new FileInputStream(files[i]);
          out.putNextEntry(new ZipEntry(files[i].getName()));
          int len;
          while ((len = in.read(buf)) > 0) {
            out.write(buf, 0, len);
          }
          out.closeEntry();
          in.close();
        }
        out.close();
      } finally {
        IOUtils.closeQuietly(zin);
        IOUtils.closeQuietly(out);
        tempFile.delete();
      }
    }
  }

  /**
   * <p>
   * 添加文件到已存在的zip文件或jar文件
   * </p>
   * 
   * @author wuxing
   * @version 1.0
   * @param zipFile
   * @param files
   * @param destZipFile
   * @throws IOException
   */
  public static void addFilesToExistingZip(File zipFile, File[] files, File destZipFile)
      throws IOException {

    if (zipFile != null && zipFile.exists() && zipFile.isFile()) {
      File tempFile = null;
      boolean flagEqual = false;
      java.util.zip.ZipOutputStream out = null;
      ZipInputStream zin = null;
      try {
        byte[] buf = new byte[1024];

        zin = new ZipInputStream(new FileInputStream(zipFile));

        String abPath = zipFile.getAbsolutePath();

        String destABPath = destZipFile.getAbsolutePath();

        Object[] args = makeDirsAndFiles(zipFile, destZipFile, abPath, destABPath);

        flagEqual = (Boolean) args[0];

        if (flagEqual) {
          tempFile = File.createTempFile(zipFile.getName(), null);
        } else {
          tempFile = destZipFile;
        }
        out = new java.util.zip.ZipOutputStream(new FileOutputStream(tempFile));
        java.util.zip.ZipEntry entry = zin.getNextEntry();
        while (entry != null) {
          String name = entry.getName();
          boolean notInFiles = true;
          for (File f : files) {
            if (f.getName().equals(name)) {
              notInFiles = false;
              break;
            }
          }
          if (notInFiles) {
            out.putNextEntry(new ZipEntry(name));
            int len;
            while ((len = zin.read(buf)) > 0) {
              out.write(buf, 0, len);
            }
          }
          entry = zin.getNextEntry();
        }
        zin.close();
        for (int i = 0; i < files.length; i++) {
          InputStream in = new FileInputStream(files[i]);
          out.putNextEntry(new ZipEntry(files[i].getName()));
          int len;
          while ((len = in.read(buf)) > 0) {
            out.write(buf, 0, len);
          }
          out.closeEntry();
          in.close();
        }
        out.close();
      } finally {
        IOUtils.closeQuietly(zin);
        IOUtils.closeQuietly(out);
        if (flagEqual) {
          FileUtils.forceDelete(zipFile);
          tempFile.renameTo(zipFile);
        }
      }
    }
  }

  /**
   * 重载createZip方法
   * 
   * @param files 文件集合
   * @param filePath 文件路径
   * @param fileName 文件名称
   * @return true表示压缩成功 false表示压缩失败
   * 
   *         ninglong20110902 重新抓取异常
   * @throws Exception
   */
  public static boolean createZip(List<File> files, String filePath, String fileName) {
    if (files == null || files.isEmpty()) {
      return false;
    }
    if (fileName == null || "".equals(fileName)) {
      return false;
    }
    if (!fileName.endsWith(".zip")) {
      fileName += ".zip";
    }
    ZipOutputStream zos = null;
    InputStream inputStream = null;
    try {
      zos = new ZipOutputStream(new FileOutputStream(filePath + fileName));
      zos.setEncoding(GBK_ENCODE);
      for (File file : files) {
        ZipEntry zipEntry = null;
        byte[] buffer = new byte[1024 * 4];
        zipEntry = new ZipEntry(file.getName());
        zipEntry.setSize(file.length());
        zipEntry.setTime(file.lastModified());
        zos.putNextEntry(zipEntry);
        inputStream = new BufferedInputStream(new FileInputStream(file));
        int readLength = inputStream.read(buffer, 0, buffer.length);
        while (readLength != -1) {
          zos.write(buffer, 0, readLength);
          readLength = inputStream.read(buffer, 0, buffer.length);
        }
        inputStream.close();
      }
    } catch (FileNotFoundException e) {
      // e.printStackTrace();
      return false;
    } catch (IOException e) {
      // e.printStackTrace();
      return false;
    } finally {
      if (zos != null) {
        try {
          zos.close();
        } catch (IOException e) {
        }
      }
      if (inputStream != null) {
        try {
          inputStream.close();
        } catch (IOException e) {
        }
      }
    }
    return true;
  }

  /**
   * 压缩文件
   * 
   * @param files 文件信息集合
   * @param filePath 文件路径
   * @return true表示压缩 false表示未压缩
   * @throws IOException
   */
  public static boolean CreateZip(List<String> files, String filePath) throws IOException {
    // double k = Math.random();
    // String filename = Double.toString(k) + ".zip";
    filePath = filePath + ".zip";
    ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(filePath));
    zos.setEncoding(GBK_ENCODE); // huangheng 20091021 指定编码，防止乱码问题
    ZipEntry ze = null;
    byte[] buf = new byte[1024];
    int readLen = 0;
    for (int i = 0; i < files.size(); i++) {
      File f = new File(files.get(i));
      // 创建一个ZipEntry，并设置Name和其它的一些属性
      // String fn=new
      // String(((String)files.get(i)).getBytes("GBK"),"8859_1");
      ze = new ZipEntry(f.getName());
      ze.setSize(f.length());
      ze.setTime(f.lastModified());
      // 将ZipEntry加到zos中，再写入实际的文件内容
      zos.putNextEntry(ze);
      InputStream is = new BufferedInputStream(new FileInputStream(f));
      while ((readLen = is.read(buf, 0, 1024)) != -1) {
        zos.write(buf, 0, readLen);
      }
      is.close();
      // System.out.println(" done...");
    }
    zos.close();
    return true;
    // 压缩后删除原文件
    // for (int i = 0; i < files.size(); i++) {
    // File f = new File( (String) files.get(i));
    // if (f.exists()) {
    // f.delete();
    // }
    // }
    // return filePath;

  }

  /**
   * 压缩文件
   * 
   * @param files 文件信息集合
   * @return 文件名称
   * @throws IOException
   */
  public static String CreateZip(String[] files) throws IOException {

    // List fileList = getSubFiles(new File(baseDir));
    double k = Math.random();

    String filename = Double.toString(k) + ".zip";
    ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(filename));
    zos.setEncoding(GBK_ENCODE); // huangheng 20091021 指定编码，防止乱码问题
    ZipEntry ze = null;
    byte[] buf = new byte[1024];
    int readLen = 0;
    for (int i = 0; i < files.length; i++) {
      File f = new File((String) files[i]);
      // 创建一个ZipEntry，并设置Name和其它的一些属性
      ze = new ZipEntry(f.getName());
      ze.setSize(f.length());
      ze.setTime(f.lastModified());
      // 将ZipEntry加到zos中，再写入实际的文件内容
      zos.putNextEntry(ze);
      InputStream is = new BufferedInputStream(new FileInputStream(f));
      while ((readLen = is.read(buf, 0, 1024)) != -1) {
        zos.write(buf, 0, readLen);
      }
      is.close();
      // System.out.println(" done...");
    }
    zos.close();
    // 压缩后删除原文件
    // for (int i = 0; i < files.length; i++) {
    // File f = new File( (String) files[i]);
    // if (f.exists()) {
    // f.delete();
    // }
    // }
    return filename;
  }

  /**
   * wuxing
   * 
   * @param files 文件集合
   * @param destZipFile 目标文件路径
   * @param baseDir 基本目录
   * @return
   */
  public static boolean createZipIncludeDirectory(List<File> files, String destZipFile,
      String baseDir) {
    if (files == null || files.isEmpty()) {
      return false;
    }
    if (CollectionUtils.isEmpty(files) || StringUtils.isEmpty(destZipFile)
        || !destZipFile.endsWith(".zip")) {
      return false;
    }
    ZipOutputStream zos = null;
    InputStream inputStream = null;
    try {
      zos = new ZipOutputStream(new FileOutputStream(destZipFile));
      zos.setEncoding(GBK_ENCODE);
      if (StringUtils.isEmpty(baseDir)) {
        for (File file : files) {
          String entryName = file.getAbsolutePath();
          int index = entryName.indexOf(File.separator);
          if (index > 0) {
            entryName = entryName.substring(index + 1);
          }
          if (!File.separator.equals(SLASH))
            entryName.replaceAll(FOUR_BACKSLASH, SLASH);
          if (file.isDirectory()) {
            entryName += SLASH;
            zos.putNextEntry(new ZipEntry(entryName));
          } else {
            zos.putNextEntry(new ZipEntry(entryName));
            byte[] buffer = new byte[1024 * 4];
            inputStream = new BufferedInputStream(new FileInputStream(file));
            int len = 0;
            while ((len = inputStream.read(buffer, 0, buffer.length)) != -1) {
              zos.write(buffer, 0, len);
            }
          }
          inputStream.close();
          zos.closeEntry();
        }
      } else {
        for (File file : files) {
          String entryName = file.getAbsolutePath();
          int index = entryName.lastIndexOf(baseDir);
          if (index > 0) {
            entryName = entryName.substring(index + baseDir.length());
          } else {
            index = entryName.indexOf(File.separator);
            if (index > 0) {
              entryName = entryName.substring(index + 1);
            }
          }
          if (!File.separator.equals(SLASH))
            entryName.replaceAll(FOUR_BACKSLASH, SLASH);
          if (file.isDirectory()) {
            entryName += SLASH;
            zos.putNextEntry(new ZipEntry(entryName));
          } else {
            zos.putNextEntry(new ZipEntry(entryName));
            byte[] buffer = new byte[1024 * 4];
            inputStream = new BufferedInputStream(new FileInputStream(file));
            int len = 0;
            while ((len = inputStream.read(buffer, 0, buffer.length)) != -1) {
              zos.write(buffer, 0, len);
            }
          }
          inputStream.close();
          zos.closeEntry();
        }
      }
    } catch (FileNotFoundException e) {
      // e.printStackTrace();
      log.error(e.getMessage());
      return false;
    } catch (IOException e) {
      // e.printStackTrace();
      log.error(e.getMessage());
      return false;
    } catch (Exception e) {
      // e.printStackTrace();
      log.error(e.getMessage());
    } finally {
      try {
        if (zos != null) {
          zos.close();
        }
        if (inputStream != null) {
          inputStream.close();
        }
      } catch (IOException e) {
        log.error(e.getMessage());
      }
    }
    return true;
  }

  /**
   * 解压文件
   * 
   * @param zipFileName 文件名称
   * @param exportFilePath 导出路径
   * @return 导出文件路径
   */
  @SuppressWarnings("rawtypes")
  public static String extZipFileList(String zipFileName, String exportFilePath) {
    try {
      ZipFile zipfile = new ZipFile(zipFileName);
      InputStream in = null;
      ZipEntry entry = null;
      File files = new File(exportFilePath);
      if (files.exists() == false) {
        files.mkdirs();
      }
      @SuppressWarnings("unused")
      String inpath = exportFilePath;
      Enumeration ea = zipfile.getEntries();
      while (ea.hasMoreElements()) {
        entry = (ZipEntry) ea.nextElement();
        String entryName = entry.getName();
        if (entry.isDirectory()) {
          File file = new File(exportFilePath + SLASH + entryName);// liukaiyuan
          // 20080925
          // 文件夹情况
          // 添加“/”
          file.mkdirs();
          inpath += SLASH + file.getName();
        } else {
          File newfile =
              new File(exportFilePath + File.separator
                  + entryName.substring(0, entryName.lastIndexOf(SLASH) + 1));
          newfile.mkdirs();
          newfile = new File(exportFilePath + File.separator + entryName);
          newfile.createNewFile();
          FileOutputStream os = new FileOutputStream(newfile);
          in = zipfile.getInputStream(entry);
          byte[] buf = new byte[1024];
          int len;
          while ((len = in.read(buf)) > 0) {
            os.write(buf, 0, len);
          }
          os.close();
          in.close();
        }
      }
    } catch (Exception e) {
      // e.printStackTrace();//zhangyuanxi 20100812 屏蔽异常信息
    }
    return exportFilePath;
  }

  /**
   * <p>
   * 生成目标文件
   * </p>
   * 
   * @author wuxing
   * @version 1.0
   * @param source
   * @param dest
   * @param abPath
   * @param destABPath
   * @return
   * @throws IOException
   */
  private static Object[] makeDirsAndFiles(final File source, File dest, String abPath,
      String destABPath) throws IOException {
    boolean flagEqual = false;
    if (abPath.equalsIgnoreCase(destABPath)) {
      flagEqual = true;
    } else {
      if (dest.getParentFile() != null && !dest.getParentFile().exists()) {
        dest.getParentFile().mkdirs();
      }
      if (!dest.exists()) {
        if (StringUtils.isNotEmpty(FilenameUtils.getExtension(destABPath))) {
          dest.createNewFile();
        } else {
          FileUtils.forceMkdir(dest);
          dest = new File(destABPath + File.separator + source.getName());
          if (!dest.exists())
            dest.createNewFile();
        }
      } else {
        if (dest.isDirectory()) {
          if (!source.getParentFile().getAbsolutePath().equalsIgnoreCase(destABPath)) {
            dest = new File(destABPath + File.separator + source.getName());
          } else {
            flagEqual = true;
          }
          if (!dest.exists())
            dest.createNewFile();
        }
      }
    }

    return new Object[] {flagEqual, dest};
  }

  /**
   * 压缩方法
   * 
   * @param out ZipOutputStream
   * @param f 文件名称
   * @param base zip入口名称
   * @throws Exception
   */
  private static void zip(ZipOutputStream out, File f, String base) throws Exception {
    if (f.isDirectory()) {
      File[] fl = f.listFiles();
      out.putNextEntry(new org.apache.tools.zip.ZipEntry(base + SLASH));
      base = base.length() == 0 ? "" : base + SLASH;
      for (int i = 0; i < fl.length; i++) {
        zip(out, fl[i], base + fl[i].getName());
      }
    } else {
      out.putNextEntry(new org.apache.tools.zip.ZipEntry(base));
      // FileInputStream in = new FileInputStream(f);
      // int b;
      // while ( (b = in.read()) != -1) {
      // out.write(b);
      // }
      // in.close();
      // zhangwenbin 优化zip打包速度 20100407 其它地方未经测试，如出现问题请及时通知
      byte[] buffer = new byte[1024 * 4];
      InputStream inputStream = new BufferedInputStream(new FileInputStream(f));
      int readLength = inputStream.read(buffer, 0, buffer.length);
      while (readLength != -1) {
        out.write(buffer, 0, readLength);
        readLength = inputStream.read(buffer, 0, buffer.length);
      }
      inputStream.close();
    }
  }

  /**
   * 
   * 无参构造器
   */
  public ZipUtil() {

  }

  /**
   * 清空文件夹 工具方法
   * 
   * @param directoryPath 目录名称
   */
  public void clearDirectoryFiles(String directoryPath) {
    if ((null != directoryPath) && (!"".equals(directoryPath.trim()))) {
      try {
        File directoryFile = new File(directoryPath);
        if ((null != directoryFile) && (directoryFile.isDirectory())) {
          String[] filePathes = directoryFile.list();
          if ((null != filePathes) && (filePathes.length > 0)) {
            File tmpFile = null;
            for (int i = 0; i < filePathes.length; i++) {
              try {
                tmpFile = new File(directoryPath + "//" + filePathes[i]);
                if (tmpFile.isDirectory()) {
                  clearDirectoryFiles(directoryPath + "//" + filePathes[i]);
                }
                if (tmpFile.canWrite() || tmpFile.delete()) {
                  tmpFile.delete();
                }
              } catch (Exception ex) {
                ex.printStackTrace();
              }
            }
          }
        }
        directoryFile.delete();
      } catch (Exception ex) {
        ex.printStackTrace();
      }
    }
  }

  /**
   * zipFileName 输入一个文件夹 inputFilePath 输出一个压缩文件夹
   * 
   * @param zipFileName 压缩文件名称
   * @param inputFilePath 压缩后的文件名称
   * @throws Exception
   */
  public void createZip(String zipFileName, String inputFilePath) throws Exception {
    ZipOutputStream out = new ZipOutputStream(new FileOutputStream(zipFileName));
    out.setEncoding(GBK_ENCODE); // huangheng 20091021 指定编码，防止乱码问题
    zip(out, new File(inputFilePath), "");
    out.flush();// longjunhao 20140528 add
    out.close();
  }

  /**
   * 为让离线编辑器打完的zip包解压时以一个整体
   * 
   * @param zipFileName 压缩文件名称
   * @param inputFilePath 压缩后的文件名称
   * @param base zip入口名称
   * @throws Exception
   * @author zhangwenbin
   */
  public void createZip(String zipFileName, String inputFilePath, String base) throws Exception {
    ZipOutputStream out = new ZipOutputStream(new FileOutputStream(zipFileName));
    out.setEncoding(GBK_ENCODE);
    zip(out, new File(inputFilePath), base);
    out.close();
  }
}
