package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * 导入结构字段工具类
 * @author wanghongchen
 *
 */
public class TagExcelImportUtil {
  private Workbook wb = null;
  private Sheet sheet = null;
  private Row row = null;
  
  public TagExcelImportUtil(String path){
    try {
      InputStream in = new FileInputStream(new File(path));
      if(path.toLowerCase().endsWith(".xls")){
        wb = new HSSFWorkbook(in);
      }else{
        wb = new XSSFWorkbook(in);
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    sheet = wb.getSheetAt(0);
  }
  
  public List<Map<String, String>> read() {
    List<Map<String, String>> rtList = new ArrayList<Map<String, String>>();
    int rowNum = sheet.getLastRowNum();
    int cellNum = -1;
    if (rowNum > -1) {
      cellNum = sheet.getRow(0).getLastCellNum();
      List<String> header = new ArrayList<String>();
      //shimiao 20140722 小于等于
      for (int i = 0; i <= rowNum; i++) {
        row = sheet.getRow(i);
        Map<String, String> rowMap = new HashMap<String, String>();
        for (int j = 0; j < cellNum; j++){
          if (i == 0) {
            header.add(row.getCell(j).getStringCellValue());
          } else {
            if(row.getCell(j) == null){
              rowMap.put(header.get(j), "");
            }else if(row.getCell(j).getCellType() == Cell.CELL_TYPE_NUMERIC){
              String tcv = String.valueOf(row.getCell(j).getNumericCellValue());
              if(tcv.indexOf(".")>0){
                rowMap.put(header.get(j), tcv.substring(0,tcv.indexOf(".")));
              }else{
                rowMap.put(header.get(j), tcv);
              }
            }else{
              rowMap.put(header.get(j), row.getCell(j).getStringCellValue());
            }
          }
        }
        if(i > 0){
          rtList.add(rowMap);
        }
      }
    }

    return rtList;
  }
}
