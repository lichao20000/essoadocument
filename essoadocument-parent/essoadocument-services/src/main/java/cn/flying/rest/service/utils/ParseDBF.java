package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import com.linuxense.javadbf.DBFException;
import com.linuxense.javadbf.DBFField;
import com.linuxense.javadbf.DBFReader;

/**
 * 解析dbf数据导入类
 * 
 * 
 */
public class ParseDBF {
    /**
     * 数据信息
     */
    private DataMap dataMap;

    /**
     * 标题集合
     */
    private List titles = new ArrayList();

    /**
     * 实例化DBFReader
     * 
     * @param file
     *            要读入的文件
     * @param fis
     *            dbf文件的输入流
     * @param fist
     *            dbf的fpt文件输入流
     * @return DBFReader实例
     * @author wangfei 20101204
     * @throws Exception
     */
    private DBFReader getDBFReader(File file, InputStream fis, InputStream fist)
            throws Exception {
        DBFReader reader = null;
        fis = new FileInputStream(file.toString());
        String fptFileStr = file.toString().replace(".DBF", ".fpt").replace(
                ".dbf", ".fpt");
        File fptFile = new File(fptFileStr);
        if (fptFile.exists()) {
            fist = new FileInputStream(fptFile.toString());
            reader = new DBFReader(fis, fist);
        } else {
            reader = new DBFReader(fis, null);
        }
        return reader;
    }

    /**
     * 获取所有的列名
     * 
     * @return 列名集合
     * @author tangshuang 20091217
     */
    public List getTitle() {
        List list = new ArrayList();
        for (int i = 0; i < titles.size(); i++) {
            if (null != titles.get(i) && !"".equals(titles.get(i)))
                list.add(titles.get(i));
        }
        titles = null;
        return list;
    }

    /**
     * 单独读取文件的列
     * 
     * @param file
     *            文件
     * @return 列名集合
     * @author add ninglong20100912
     */
    public List<String> gettitle(File file) {
        List<String> titles = new ArrayList<String>();
        InputStream fis = null;
        InputStream fist = null; // add wangfei 20101204
        try {
            DBFReader reader = this.getDBFReader(file, fis, fist); // add
            // wangfei
            // 20101204
            // 得到DBFReader对象
            reader.setCharactersetName("GBK");
            int fieldsCount = reader.getFieldCount();
            for (int i = 0; i < fieldsCount; i++) {
                DBFField field = reader.getField(i);
//                String strTitle = new String(
//                        field.getName().getBytes("GB2312"), "GBK");
                String strTitle = field.getName() ;
                
                if (strTitle == null || strTitle.length() <= 0) {
                    continue;
                }
                titles.add(strTitle);
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (DBFException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                fis.close();
                if (fist != null)
                    fist.close();
            } catch (Exception e) {
            }
        }
        return titles;
    }

    /**
     * 文件基本信息校验。
     * 
     * @param file
     *            文件
     * @return 校验信息
     * @author shilongfei 20101123 add
     */
    public String checkFile(File file) {
        return gettitle(file).size() > 0 ? "" : "文件\"" + file.getName()
                + "\"的列头内容为空，请核实重试";
    }

    /**
     * 检查文件中是否有meno类型的字段
     * 
     * @param file
     *            文件
     * @return true表示有 false表示没有
     * @author ninglong20111025
     */
    public boolean checkFileHasMeno(File file) {
        boolean flag = true;
        InputStream fis = null;
        try {
            fis = new FileInputStream(file.toString());
            DBFReader reader = new DBFReader(fis);
            reader.setCharactersetName("GBK");
            reader.getFieldCount();
        } catch (Exception e) {
            e.printStackTrace();
            flag = false;
        } finally {
            try {
                if (fis != null)
                    fis.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return flag;
    }
}
