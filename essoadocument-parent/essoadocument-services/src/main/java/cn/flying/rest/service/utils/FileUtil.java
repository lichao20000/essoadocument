package cn.flying.rest.service.utils;

import java.io.File;

public class FileUtil {

  /**
   * 删除文件或者文件夹(适用于Linux或者Windows，Unix下未经测试)
   * 
   * @author huangheng 20080428 add
   * @param delpath
   * @return boolean
   */
  public static boolean deletefile(String delpath) {
    try {
      File file = new File(delpath);
      // fuhongyi 20100402 edit
      // if (!file.isDirectory()) {
      // file.delete();
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
                deletefile(delpath + "/" + filelist[i]);
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

  /**
   * 删除文件夹及内部文件
   * 
   * @author zhanglei 20130314
   * @param path
   */
  public static void deleteAllFile(String path) {
    File file = new File(path);
    if (file.exists()) {
      if (file.isFile()) {
        file.delete();
      } else {
        File[] childfile = file.listFiles();
        for (File s : childfile) {
          deleteAllFile(s.getAbsolutePath());
        }
        file.delete();
      }
    }
  }

  /**
   * 创建此抽象路径名命名的目录，包括任何必要的，但不存在的父目录
   * 
   * @param path 文件路径
   */
  public static final void createPath(String path) {
    if (!isExistPath(path)) {
      File file = new File(path);
      file.mkdirs();
    }
  }

  /**
   * 判断路径是否存在
   * 
   * @param path 文件路径
   * @return true表示存在 false表示不存在
   */
  public static final boolean isExistPath(String path) {
    return new File(path).exists();
  }

}
