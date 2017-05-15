/**
 * 
 */
package cn.flying.rest.service.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.OfficeXmlFileException;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;

/**
 * 解析xsl文件
 * 
 * @author jin 20070308
 * 
 */
public class ParseExcel {
	/**
	 * 工作手册
	 */
	private HSSFWorkbook workBook = null;

	/**
	 * 工作表
	 */
	private HSSFSheet sheet;

	/**
	 * 标题集合
	 */
	private List titles = new ArrayList();

	/**
	 * 无参构造
	 * 
	 */
	public ParseExcel() {

	}

	/**
	 * 获取workBook
	 * 
	 * @param poiFs
	 *            POIFS系统文件管理
	 * @return 工作手册
	 */
	private HSSFWorkbook getWorkBook(POIFSFileSystem poiFs) {
		try {
			this.workBook = new HSSFWorkbook(poiFs);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return this.workBook;

	}

	/**
	 * 获取sheet
	 * 
	 * @return 工作表
	 */
	private HSSFSheet getSheet() {
		sheet = workBook.getSheetAt(0);
		return sheet;

	}

	/**
	 * 获取总行数
	 * 
	 * @return 行数
	 */
	private int getRowNum() {
		int RowNum = sheet.getLastRowNum();
		return RowNum;
	}

	/**
	 * 获取单元类型 Numeric:0 String:1 Formula:2 Blank:3 Boolean:4 Error:5
	 * 
	 * @param cell
	 *            单元
	 * @return 单元类型
	 */
	private short getCellType(HSSFCell cell) {
		short cellType = 3;
		try {
			cellType = (short) cell.getCellType();
		} catch (Exception ex) {
			cellType = 3;
		}
		return cellType;
	}

	/**
	 * 重载读文件的方法
	 * 
	 * @param file
	 *            文件
	 * @return 数据集合
	 */
	public List<LinkedHashMap<String, String>> getRowValues(File file) {
		List<LinkedHashMap<String, String>> list = new ArrayList<LinkedHashMap<String, String>>();
		checkFile(file);
		LinkedHashMap<String, String> lhm = null;
		/**
		 * 获取第一行
		 */
		// String[] title = new String[Integer.parseInt(new
		// Long(sheet.getRow(0).getLastCellNum()).toString())] ;
		// //此处会获取不到所有的列，怀疑是POI的问题 liukaiyuan 20090920
		// chenqi 20100526 验证空Excel=========
		if (sheet.getRow(0) == null) {
			return list;
		}
		// end=======
		// liukaiyuan +1做法错误 还原为原来的代码 20100531
		// String[] title = new String[sheet.getRow(0).getLastCellNum()]
		// ;//chenzhenhai 20100518 构造数组为最后一列值加“1”不然后把最后一列丢掉
		// chenzhenhai 20100607 add 获取表的实际列数,解决数据导入后不经修改导入会丢掉最后一列的问题
		int cellNum = sheet.getRow(0).getPhysicalNumberOfCells();
		String[] title = new String[cellNum];
		for (int n = 0; n < title.length; n++) {
			if (null != sheet.getRow(0).getCell(n).getStringCellValue()) {
				title[n] = sheet.getRow(0).getCell(n).getStringCellValue()
						.trim();
			}
		}

		// 遍历所有行
		for (int i = 1; i <= this.getRowNum(); i++) {
			HSSFRow row = sheet.getRow(i);
			if (row == null) {
				continue;
			}
			// short cellNum = row.getLastCellNum();//chenzhenhai 20100607 注掉
			HSSFCell cell = null;
			lhm = new LinkedHashMap<String, String>();

			// 遍历所有列
			// for(short j = 0 ; j<cellNum; j++){
			// liukaiyuan +1做法错误 还原为原来的代码 20100531
			for (int j = 0; j < cellNum; j++) {// chenzhenhai 20100518 modify
				// "j<=cellNum",如果不加"="判断会丢掉最后一列
				cell = row.getCell(j);

				if (getCellType(cell) == 0) {
					if (HSSFDateUtil.isCellDateFormatted(cell)) {
						DateFormat dfs = DateFormat.getDateInstance();
						lhm.put(title[j], dfs.format(cell.getDateCellValue()));
					} else {
						lhm.put(title[j],
								new Double(cell.getNumericCellValue())
										.toString().trim());
					}
				} else if (getCellType(cell) == 1)
					lhm.put(title[j], cell.getStringCellValue().trim());
				else if (getCellType(cell) == 2)
					lhm.put(title[j], cell.getCellFormula().trim());
				else if (getCellType(cell) == 4)
					lhm.put(title[j], new Boolean(cell.getBooleanCellValue())
							.toString().trim());
				else if (getCellType(cell) == 5)
					lhm.put(title[j], new Byte(cell.getErrorCellValue())
							.toString());
				else
					lhm.put(title[j], null);
			}
			list.add(lhm);
		}
		return list;
	}

	/**
	 * 获得Excel第一行的所有字段名
	 * 
	 * @return 字段名集合
	 * @author wangjie 2009-12-6
	 */
	@SuppressWarnings("unchecked")
	public List getTitle() {
		/*
		 * String[] title = new String[sheet.getRow(0).getLastCellNum()] ;
		 * //此处会获取不到所有的列，怀疑是POI的问题 liukaiyuan 20090920 for (short n=0; n<
		 * title.length; n++){
		 * if(null!=sheet.getRow(0).getCell(n).getStringCellValue()) { title[n] =
		 * sheet.getRow(0).getCell(n).getStringCellValue().trim() ; } } return
		 * title;
		 */
		List t = new ArrayList();
		for (int i = 0; i < titles.size(); i++) {
			if (null != titles.get(i) && !"".equals(titles.get(i)))
				t.add(titles.get(i));
		}
		titles = null;
		return t;
	}

	/**
	 * 只获取文件的第一行
	 * 
	 * @param file
	 *            文件
	 * @return 返回文件的列
	 * @author add ninglong20100912
	 */
	@SuppressWarnings("unchecked")
	public List<String> getTitles(File file) {
		List<String> list = new ArrayList<String>();
		// shilongfei 20101123 提取文件校验方法 add
		String strExceptionMsg = checkFile(file);
		if (strExceptionMsg.length() > 0) {// 文件校验
			// shilongfei 20101123 end
			return list;
		}
		int cellNum = sheet.getRow(0).getPhysicalNumberOfCells();
		for (int n = 0; n < cellNum; n++) {
			String value = sheet.getRow(0).getCell(n).getStringCellValue();
			// luowenfei 20110325 去掉列头中的换行
			value = value.replace("\n", "");
			if (null != value && !"".equals(value.trim())) {
				list.add(value);
			}
		}
		return list;
	}

	/**
	 * 文件基本信息校验。
	 * 
	 * @param file
	 *            文件
	 * @return 基本校验信息
	 * @author shilongfei 20101123 add
	 */
	public String checkFile(File file) {
		POIFSFileSystem poiFs = null;
		String strExceptionMsg = "";
		String strFileName = file == null ? "" : "\"" + file.getName() + "\"";
		try {
			poiFs = new POIFSFileSystem(new FileInputStream(file));
			workBook = this.getWorkBook(poiFs);
			sheet = this.getSheet();
			if (sheet.getRow(0) == null) {
				// luowenfei 20110325 去掉“无法”
				// strExceptionMsg = "文件" + strFileName + "的内容不能无法转换，请核实重试";
				strExceptionMsg = "文件" + strFileName + "的内容不能转换，请核实重试";
			}
			// shangfei 20110510 add 增加对单元格去除空格的判断 start
			else {
				int colNum = sheet.getRow(0).getPhysicalNumberOfCells();
				int tempFlag = 0;
				for (int coli = 0; coli < colNum; coli++) {
					String cellValue = sheet.getRow(0).getCell(coli)
							.getStringCellValue().trim();
					if (cellValue == "" || cellValue.equals(null)) {
						tempFlag++;
					}
				}
				tempFlag += 1;
				if (tempFlag == colNum) {
					strExceptionMsg = "文件" + strFileName + "的内容不能转换，请核实重试";
				}
			}
			// shangfei 20110510 add 增加对单元格去除空格的判断 end
		} catch (IOException io) {
			strExceptionMsg = "文件" + strFileName + "读写异常，请核实重试";
		} catch (OfficeXmlFileException e) {
			strExceptionMsg = "文件" + strFileName
					+ "的内容格式暂不支持，<br>请确认文件格式为Office 97-2003";
		} catch (Exception e) {
			strExceptionMsg = "文件" + strFileName + "操作出现异常，请核实重试";
		}
		return strExceptionMsg;
	}

	/**
	 * 求一个字符串中某字符串出现的次数
	 * 
	 * @param str
	 *            字符串
	 * @param s
	 *            字符
	 * @param count
	 *            次数
	 * @return 共出现的次数
	 * @author ninglong20120221
	 */
	private int getStringCout(String str, String s, int count) {
		if (str.indexOf(s) > 0) {
			int temp = str.indexOf(s, str.indexOf(s) + 1);
			count = count + 1;
			if (temp > 0) {
				count = getStringCout(str.substring(temp - 1, str.length()), s,
						count);
			}
		}
		return count;
	}

	public static void main(String args[]) throws IOException {
		// List<File> files = new ArrayList<File>() ;
		// files.add(new File("c:/aa.xls")) ;
		// files.add(new File("E:\\W2005HJ.xls"));
		ParseExcel parseExcel = new ParseExcel();
		int s = parseExcel
				.getStringCout(
						"& 北京东方@飞@扬@软件技术股份公司 & 文书档案 & 一事一件库 & 2010年度@文书档案件盒级结构@文书档案件盒电子文件级结构",
						"@", 0);
		System.out.println(s);
		// List<SimplePkg> simplePkgs = parseExcel.returnSimList(files) ;
		// SimplePkg simplePkg = new SimplePkg () ;

		// System.out.println(simplePkgs);
		// long s = System.currentTimeMillis();
		// List<SimplePkg> li = parseExcel.getRowValues(new
		// File("c:\\测试.xls"),0);
		// System.out.println(li);
		// System.out.println("用时:"+(System.currentTimeMillis()-s));
		//		
		// for(LinkedHashMap<String,String> lhm :li){
		// // System.out.println(lhm.get("id").toString());
		// }
		// List<String> list = parseExcel.getTitles(new
		// File("c:\\飞扬报刊件盒级结构_大数据量.xls"));
		// System.out.println(list);
	}
	
	//wuxing 20121112 bug(id:6500)
	private HSSFSheet getSheet(int index) {
		sheet = workBook.getSheetAt(index);
		return sheet;

	}
	//wuxing 20121112 bug(id:6500)
	private HSSFSheet getSheet(String name) {
		sheet = workBook.getSheet(name);
		return sheet;

	}
	
   /**
    * 用于解析模板定义树的功能
    * @author xuhongyan at 20121126
    * @param pathName 被解析的Excel文件的路径
    * @return
    */ 
	 public String[][] parseTreeExcel(String pathName) throws Exception {
			POIFSFileSystem poisFile;
			String[][] arrayData = null;// 定义二维树组用来存放解析后的excel存放的数据
			try {
				poisFile = new POIFSFileSystem(new FileInputStream(pathName));
				HSSFWorkbook hsBook = new HSSFWorkbook(poisFile);
				for (int i = 0; i < hsBook.getNumberOfSheets(); i++) {
					HSSFSheet sheet = hsBook.getSheetAt(i);// 获取sheet表单
					if (sheet.getRow(0) == null) {
						break;
					}
					int colCount = sheet.getRow(0).getPhysicalNumberOfCells();// 列数
					int rows = sheet.getPhysicalNumberOfRows();// 行数
            
					// 实例化二维数组，并赋予行数
					arrayData = new String[rows][];
					// 去掉表头，从第二行开始收集记录
					for (int j = 0; j < rows; j++) {
						// 给二维数组每行分配列数
						arrayData[j] = new String[colCount];
						for (int m = 0; m < colCount; m++) {
							// 获取到当前行的单元格的值
							HSSFCell cell = sheet.getRow(j).getCell(m);
							// cell中存储数据的格式
							int cellType = cell.getCellType();
							String cellValue = "";
							if (cellType == HSSFCell.CELL_TYPE_NUMERIC)// 数字类型
							{
								cellValue += (cell.getNumericCellValue()+"").substring(0,(cell.getNumericCellValue()+"").indexOf("."));

							} else if (cellType == HSSFCell.CELL_TYPE_STRING
									|| cellType == HSSFCell.CELL_TYPE_FORMULA
									|| cellType == HSSFCell.CELL_TYPE_BLANK
									|| cellType == HSSFCell.CELL_TYPE_ERROR) {// 字符类型
								// 或者 公式类型
								// 或者 空类型
								// 或者 错误类型
								cellValue = cell.getStringCellValue();
							} else if (cellType == HSSFCell.CELL_TYPE_BLANK)// 布尔类型
							{
								cellValue += cell.getBooleanCellValue();
							}

							arrayData[j][m] = cellValue;
						}
					}
				}
			} catch (Exception e) {
			/**edit jinwei 20130226 注释掉异常的抛出，调用该方法的地方做过判断**/
//				e.printStackTrace();
			}
			return arrayData;
		}
		/**
		 * 查找上级节点方法
		 * @author xuhongyan at 20121126
		 * @param rowI 当前节点的行下标
		 * @param columnI 当前节点的列下标
		 * @param arrayData Excel解析的数据
		 * @param splitor Excel模板中的占位符
		 * @returnRows 返回的编号id、parentid的String[arrayData.length][5]{title,id,parentid,rowIndex,columnIndex}
		 */
		private static String[] getParent(int rowI, int columnI, String[][] arrayData,
				String splitor,String[][] returnRows){
			if(rowI==0){//如果找到
				return returnRows[rowI];
			}
			//columnI判空。rowI判空
			String columnIndex=returnRows[rowI-1][4];
			if(columnIndex!=null&&!"".equals(columnIndex)){
				int ci=Integer.parseInt(columnIndex);
				if(ci<columnI){//
					if(ci==columnI-1){//上一个节点列下标小于当前节点列下标一个单位，则找到父节点，返回
						return returnRows[rowI-1];
					}else{//有异常
						System.out.println(" ci<columnI rowI:"+rowI+"\t columnI:"+columnI+"\t 有异常！");
					}
				}else{//查父节点
					//判断为0
					return getParent(--rowI,columnI,arrayData,splitor,returnRows);
				}
			}else{//不正常
				System.out.println("columnIndex!=null&&!.equalscolumnIndex rowI:"+rowI+"\t columnI:"+columnI+"\t 有异常！");
			}
			return null;
		}
		/**
		 * 给符合规范的记录编号，编号规则为：将当前行的下标赋予伪列id
		 * @author xuhongyan at 20121126
		 * @param rowI 行
		 * @param columnI 行
		 * @param arrayData 原数组
		 * @param splitor 分割符，比如"0.0"
		 * @param returnRows 返回的编号id、parentid的String[arrayData.length][5]{title,id,parentid,rowIndex,columnIndex}
		 * @return
		 * @throws Exception
		 */
		public static String[][] setup(int rowI, int columnI, String[][] arrayData,
				String splitor,String[][] returnRows) throws Exception{
			if(rowI>=arrayData.length){
				return returnRows;
			}
			if(columnI>=arrayData[rowI].length){//不合规范,抛出异常，定义异常信息
				throw new Exception("行："+rowI+"不符合模板规范！");
			}
			if(splitor.equals(arrayData[rowI][columnI])){//如果是空字符（或用符号如：“0.0”占位），则列下标加1，取出本行下一列数据
				return setup(rowI,++columnI , arrayData, splitor,returnRows);
			}else{//找到数据走else
				//title
				returnRows[rowI][0]=arrayData[rowI][columnI];
				//id 当前节点的行的索引值加1
				returnRows[rowI][1]=(rowI+1)+"";
				//parentId 
				String[] parent=getParent(rowI,columnI , arrayData, splitor,returnRows);
				if(parent!=null){//找到了当前节点的父节点，给当前节点的parentid赋值.如果当前节点为根节点，范围本身，并对父节点设置为-1；
					if(columnI==0){//根节点
						returnRows[rowI][2]=-1+"";
					}else{//不是根节点
					returnRows[rowI][2]=parent[1];
					}
				}
				//rowI
				returnRows[rowI][3]=rowI+"";
				//返回值的横纵坐标
				returnRows[rowI][4]=columnI+"";
				return setup(++rowI, 0, arrayData, splitor,returnRows);
			}
		}	 
}
