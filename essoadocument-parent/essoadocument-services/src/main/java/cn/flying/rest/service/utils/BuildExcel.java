package cn.flying.rest.service.utils;


import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.imageio.ImageIO;

import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.hssf.usermodel.HSSFPatriarch;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.RichTextString;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;


public class BuildExcel {
	private boolean isExcel2003 = true;
	
	public static BuildExcel getInstance(){
		return new BuildExcel();
	}
	
	public static BuildExcel getInstance(boolean isExcel2003){
		return new BuildExcel(isExcel2003);
	}
	
	private BuildExcel(){
	}
	
	private BuildExcel(boolean isExcel2003){
		this.isExcel2003 = isExcel2003;
	}
	
	private RichTextString getRichTextString(String text){
		if(isExcel2003) return new HSSFRichTextString(text);
		return new XSSFRichTextString(text);
	}
	
	/**
	 * 获取单元格样式颜色参数
	 * @return
	 */
	private short getWhiteIndex(){
		if(isExcel2003) return HSSFColor.WHITE.index;
		return new XSSFColor(Color.WHITE).getIndexed();
	}
	private short getBlackIndex(){
		if(isExcel2003) return HSSFColor.BLACK.index;
		return new XSSFColor(Color.BLACK).getIndexed();
	}
	
	/**
	 * 获取单元格样式
	 * @param workbook
	 * @return
	 */
	private CellStyle getCellStyle(Workbook workbook){
		Font font = workbook.createFont();
		font.setFontName("宋体");
		font.setFontHeightInPoints((short) 10);
		font.setBoldweight(Font.BOLDWEIGHT_NORMAL);
		CellStyle style = this.getCellStyle(workbook, font);
		return style;
	}
	private CellStyle getCellStyle(Workbook workbook, Font font){
		CellStyle style = workbook.createCellStyle();
		style.setFont(font);
		style.setAlignment(CellStyle.ALIGN_LEFT);// 靠左   
		style.setVerticalAlignment(CellStyle.VERTICAL_CENTER);// 上下居中   
		style.setWrapText(true);// 自动换行   
		short blackIndex = this.getBlackIndex();
		style.setLeftBorderColor(blackIndex);// 左边框的颜色   
		style.setBorderLeft((short) 1);// 左边框的大小   
		style.setRightBorderColor(blackIndex);// 右边框的颜色   
		style.setBorderRight((short) 1);// 右边框的大小   
		style.setBottomBorderColor(blackIndex); // 下边框颜色
		style.setBorderBottom((short) 1); // 下边框大小
		style.setTopBorderColor(blackIndex);// 上边框颜色
		style.setBorderTop((short) 1);// 上边框大小
		style.setFillForegroundColor(this.getWhiteIndex());// 设置单元格的背景颜色（单元格的样式会覆盖列或行的样式）   
		return style;
	}
	
	/**
	 * 构建excel
	 * @param dataColl数据结构为 外层Map key：espath ，value：Map
	 * 		内层Map key:统计项列序号，value：统计值
	 * @param pathNameMap 档案数据path对应名(名称有的重复)
	 * @param titleCollList 统计项列(有序)
	 * @return Workbook对象
	 */
	public Workbook write(Map<String,Map<String, String>> dataColl, 
			Map<String,String> pathNameMap, List<String> titleCollList,File imageFile) {
		if(dataColl.isEmpty()) return null;
		Workbook workbook = null;
		if(isExcel2003){
			workbook = new HSSFWorkbook();// 创建一个Excel文件(.xls)
		}else{
			workbook = new XSSFWorkbook();// 创建一个Excel文件(.xlsx)
		}
		int collCount = titleCollList.size();
		Sheet sheet = workbook.createSheet();// 创建一个Excel的Sheet   
		sheet.createFreezePane(0, 1);// 冻结(列数，行数)   
		
		sheet.setColumnWidth(0, 10000);// 设置列宽   
		for (int i = 0; i < collCount; i++) {
			sheet.setColumnWidth(i + 1, 4000);
		}
		
		// 列头的样式   
		Font headFont = workbook.createFont();
		headFont.setFontName("宋体");
		headFont.setFontHeightInPoints((short) 10);
		headFont.setBoldweight(Font.BOLDWEIGHT_BOLD);
		CellStyle headStyle = this.getCellStyle(workbook, headFont);
		headStyle.setAlignment(CellStyle.ALIGN_CENTER);// 左右居中   
		headStyle.setVerticalAlignment(CellStyle.VERTICAL_CENTER);// 上下居中   
		headStyle.setLocked(true);
		
		// 最左边列单元格样式   
		CellStyle leftColumnStyle = this.getCellStyle(workbook);
		// 数据值单元格样式
		CellStyle centerStyle = this.getCellStyle(workbook);
		centerStyle.setAlignment(CellStyle.ALIGN_RIGHT);// 靠右   
		
		try {
			// 创建第一行   
			Row row0 = sheet.createRow(0);
			row0.setHeight((short)800);// 设置首行行高   
			// 创建第一列   
			Cell cell0 = row0.createCell(0);
			cell0.setCellValue(this.getRichTextString("文件类型"));
			cell0.setCellStyle(headStyle);
			// 创建统计项头
			for(int i=0; i<collCount; i++){
				Cell cell = row0.createCell(i + 1);
				cell.setCellValue(this.getRichTextString(titleCollList.get(i)));
				cell.setCellStyle(headStyle);
			}
			
			Iterator<Entry<String, Map<String, String>>> iterMain = dataColl.entrySet().iterator();
			int r = 1;
			while(iterMain.hasNext()){
				Entry<String, Map<String, String>> entryMain = iterMain.next();
				String keyMain = entryMain.getKey();
				String keyMainName = pathNameMap.get(keyMain);
				Map<String, String> itemMap = entryMain.getValue();
				Row row = sheet.createRow(r++);
				row.setHeight((short) 500);// 设置统计数据行行高 
				Cell cellMain = row.createCell(0);
				cellMain.setCellValue(this.getRichTextString(keyMainName==null?"":keyMainName));
				cellMain.setCellStyle(leftColumnStyle);
				
				for(int i=0; i<collCount; i++){
					String colNo = String.valueOf(i + 1);
					Cell cell = row.createCell(i + 1);
					cell.setCellStyle(centerStyle);
					if(itemMap.containsKey(colNo)){
						try {
							cell.setCellValue(Double.parseDouble(itemMap.get(colNo)));
						} catch (Exception e) {
							cell.setCellValue(itemMap.get(colNo));
						}
					}
				}
			}
			
			//wanghongchen 20140828 添加图片，暂时只支持2003版本
			if(isExcel2003 && imageFile != null){
    			HSSFPatriarch patriarch = ((HSSFSheet)sheet).createDrawingPatriarch() ;
    	        HSSFClientAnchor anchor = new HSSFClientAnchor() ;
    	        anchor.setDx1(0) ;
    	        anchor.setDy1(0) ;
    	        anchor.setCol1(0) ;
    	        anchor.setRow1((pathNameMap.size() + 3)) ;
    	        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream() ;
    	        BufferedImage bufferedImage = ImageIO.read(imageFile) ;
    	        ImageIO.write(bufferedImage, "jpeg", byteArrayOutputStream) ;
    	        patriarch.createPicture(anchor, workbook.addPicture(byteArrayOutputStream.toByteArray(), HSSFWorkbook.PICTURE_TYPE_JPEG)).resize() ;
    	        byteArrayOutputStream.close() ;
			}
			
			return workbook;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * 构建excel并生成文件至指定目录
	 * @param dataColl数据结构为 外层Map key：espath ，value：Map
	 * 		内层Map key:统计项列序号，value：统计值
	 * @param pathNameMap 档案数据path对应名(名称有的重复)
	 * @param titleCollList 统计项列(有序)
	 * @param filePath 将文件写入至指定的目录，包含文件名
	 * @return 
	 */
	public boolean write(Map<String,Map<String, String>> dataColl, 
			Map<String,String> pathNameMap, 
			List<String> titleCollList, 
			String filePath,File imageFile) {
		Workbook workBook = write(dataColl, pathNameMap, titleCollList,imageFile);
		if(null == workBook)return false;
		try {
			FileOutputStream os = new FileOutputStream(filePath);
			workBook.write(os);
			os.flush();
			os.close();
		} catch (Exception e) {
			e.printStackTrace();
			return false ;
		}
		return true;
	}
	
	
	
//	public static void main(String[] args){
//		BuildExcel buildExcel = BuildExcel.getInstance(false);
//		List<String> titleCollList = new ArrayList<String>();
//		titleCollList.add("总计");
//		titleCollList.add("平均值");
//		titleCollList.add("最小值");
//		titleCollList.add("最大值");
//		Map<String,Map<String, String>> dataColl = new LinkedHashMap<String, Map<String, String>>();
//		Map<String, String> item1 = new HashMap<String, String>();
//		item1.put("总计", String.valueOf(100));
//		item1.put("平均值", String.valueOf(10));
//		item1.put("最小值", "1");
//		item1.put("最大值", String.valueOf(15));
//		dataColl.put("path1", item1);
//		Map<String, String> item2 = new HashMap<String, String>();
//		item2.put("总计", String.valueOf(110));
//		item2.put("平均值", String.valueOf(11));
//		item2.put("最大值", String.valueOf(13.2));
//		dataColl.put("path2", item2);
//		
//		Map<String,String> pathNameMap = new HashMap<String,String>();
//		//
//		Workbook workbook = buildExcel.write(dataColl, pathNameMap, titleCollList);
//		try {
//			FileOutputStream os = new FileOutputStream("E:\\test\\测试.xlsx");
//			workbook.write(os);
//			os.flush();
//			os.close();
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//	}
}
