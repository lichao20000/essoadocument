package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.displaytag.util.TagConstants;

import com.lowagie.text.BadElementException;
import com.lowagie.text.Cell;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.HeaderFooter;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.Table;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.rtf.RtfWriter2;

/**
 * pdf生成工具
 * 
 * @author wanghongchen 20140827
 * 
 */
public class RtfUtil {
  /**
   * 馆藏统计中生成rtf
   * @author wanghongchen 20140827
   * @param dataColl
   * @param pathNameMap
   * @param titleCollList
   * @param filePath
   * @return
   */
  public static boolean write(Map<String, Map<String, String>> dataColl,
      Map<String, String> pathNameMap, List<String> titleCollList, String filePath,File imageFile) {
    if (dataColl.isEmpty())
      return false;
    try {
      int collCount = titleCollList.size();
      Table tableRtf = new Table(collCount + 1);
      tableRtf.setAlignment(Element.ALIGN_TOP);
      tableRtf.setCellsFitPage(true);
      tableRtf.setPadding(2);
      tableRtf.setSpacing(0);
      BaseFont bfChinese =
          BaseFont.createFont("STSong-Light", "UniGB-UCS2-H", BaseFont.NOT_EMBEDDED);
      Font font = new Font(bfChinese, 9, Font.NORMAL);
      // 添加第一列
      Cell hCell1 = new Cell(new Chunk("文件类型", font));
      hCell1.setVerticalAlignment(Element.ALIGN_TOP);
      hCell1.setLeading(8);
      hCell1.setGrayFill(0.9f);
      hCell1.setHeader(true);
      tableRtf.addCell(hCell1);
      // 生成表头
      for (String title : titleCollList) {
        Cell hCell = new Cell(new Chunk(title, font));
        hCell.setVerticalAlignment(Element.ALIGN_TOP);
        hCell.setLeading(8);
        hCell.setGrayFill(0.9f);
        hCell.setHeader(true);
        tableRtf.addCell(hCell);
      }
      // 添加数据
      Iterator<Entry<String, Map<String, String>>> iterMain = dataColl.entrySet().iterator();
      while (iterMain.hasNext()) {
        Entry<String, Map<String, String>> entryMain = iterMain.next();
        String keyMain = entryMain.getKey();
        String keyMainName = pathNameMap.get(keyMain);
        Map<String, String> itemMap = entryMain.getValue();
        Cell cell1 = new Cell(new Chunk(keyMainName == null ? "" : keyMainName, font));
        cell1.setVerticalAlignment(Element.ALIGN_TOP);
        cell1.setLeading(8);
        tableRtf.addCell(cell1);
        for (int i = 0; i < collCount; i++) {
          String colNo = String.valueOf(i + 1);
          Cell cell = null;
          if (itemMap.containsKey(colNo)) {
            cell = new Cell(new Chunk(itemMap.get(colNo) == null ? "":itemMap.get(colNo), font));
          } else {
            cell = new Cell(new Chunk("", font));
          }
          cell.setVerticalAlignment(Element.ALIGN_TOP);
          cell.setLeading(8);
          tableRtf.addCell(cell);
        }
      }
      FileOutputStream out = new FileOutputStream(filePath) ;
      Document document = new Document(PageSize.A4.rotate(), 60, 60, 60, 60);
      document.addCreationDate();
      HeaderFooter footer = new HeaderFooter(new Phrase(TagConstants.EMPTY_STRING, font), true);
      footer.setBorder(Rectangle.NO_BORDER);
      footer.setAlignment(Element.ALIGN_CENTER);
      RtfWriter2.getInstance(document, out);
      document.open();            
      document.setFooter(footer);
      document.add(tableRtf);
      // 加入空行
      Paragraph paragraph = new Paragraph();
      paragraph.add(new Paragraph( " " )) ;
      document.add(paragraph);
      
      if(imageFile != null){
        //插入图片
        Image image = Image.getInstance(imageFile.getAbsolutePath()) ;
        image.setAlignment(Image.ALIGN_CENTER) ;
        double pageWidth = document.getPageSize().getWidth() - document.getPageSize().getRotation() * 2 ;
        double pageHeight = document.getPageSize().getHeight() - document.getPageSize().getRotation() * 2 ;
        if(pageWidth < image.getWidth() || pageHeight < image.getHeight()){
            double widthScale = pageWidth / image.getWidth() ;
            if((widthScale * image.getHeight()) > pageHeight ){
                image.scalePercent((float)(pageHeight * 100 / image.getHeight())) ;
            } else {
                image.scalePercent((float)(pageWidth * 100 / image.getWidth())) ;
            }
        }
        document.add(image);
      }
      
      document.close();
      out.close();
    } catch (BadElementException e) {
      e.printStackTrace();
    } catch (DocumentException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return true;
  }
}
