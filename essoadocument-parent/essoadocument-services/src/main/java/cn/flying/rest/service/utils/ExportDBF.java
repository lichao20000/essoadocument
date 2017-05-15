package cn.flying.rest.service.utils;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;




import cn.flying.rest.service.utils.VALUETYPES.TYPE;

import com.linuxense.javadbf.DBFException;
import com.linuxense.javadbf.DBFField;
import com.linuxense.javadbf.DBFWriter;

public class ExportDBF {

	public void Exception() {

	}

   

	/**
	 * @author liuhezeng
	 * @time 20131216 生成数据库更新语句
	 * @param tmpDates
	 * @param filePath
	 * @throws Exception
	 */
	public void updateDBF(String tableName,
			HashMap<String, LinkedHashMap<String, String>> tmpDates,
			String filePath) throws Exception {

		for (Iterator iter = tmpDates.entrySet().iterator(); iter.hasNext();) {

			Map.Entry entry = (Map.Entry) iter.next();
			Object key = entry.getKey();
			LinkedHashMap<String, String> val = (LinkedHashMap<String, String>) entry
					.getValue();
			List<String> tmpColumaSeps = new ArrayList<String>();
			/** 拆分出列 **/
			for (Iterator iter_column = val.entrySet().iterator(); iter_column
					.hasNext();) {
				Map.Entry entry_column = (Map.Entry) iter_column.next();
				Object key_column = entry_column.getKey();
				Object key_column_value = entry_column.getValue();
				tmpColumaSeps = genColumes(key_column_value.toString());
				/** 执行最底层的sql更新 **/
				for (String tmpValue : tmpColumaSeps) {

					updateExcute(
							genarateUpdateSql(tableName, key.toString(),
									key_column.toString(), tmpValue), filePath);
				}
			}

		}
	}

	/**
	 * @author liuhezeng
	 * @time 20131216 生成每行的更新语句
	 * @param row
	 * @param columName
	 * @param columValue
	 * @return 返回拼接之后的sql语句
	 */
	public String genarateUpdateSql(String tableName, String row,
			String columName, String columValue) {
		String sql = "update '" + tableName + "' set " + columName + " = "
				+ columName + " +'" + columValue + "' where id = " + row;
		return sql;
	}

	/**
	 * @author liuhezeng
	 * @time 20131216 拆分数据
	 * @param columeValues
	 * @return 返回拆分结果
	 */
	public List<String> genColumes(String columeValues) {
		List<String> tmp = new ArrayList<String>();
		int counter = 0;
		int index = columeValues.length() / 122;
		int columeValuesLength = columeValues.length();
		for (int i = 0; i < index + 1; i++) {
			if ((counter + 122) < columeValuesLength) {
				tmp.add(columeValues.substring(counter, counter + 122));
				counter += 122;
			} else {
				tmp.add(columeValues.substring(counter, columeValuesLength));

			}
		}
		return tmp;
	}

	/**
	 * @author liuhezeng
	 * @time 20131216 最终执行更新
	 * @param sql
	 * @param path
	 */
	public void updateExcute(String sql, String filePath) throws Exception {
		Connection connDbf = null;
		PreparedStatement psDbf = null;
		try {
			Class.forName("sun.jdbc.odbc.JdbcOdbcDriver");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		try {
			String DB_URL = "jdbc:odbc:Driver={Microsoft FoxPro VFP Driver (*.dbf)};"
					+ // 写法相对固定
					"SourceType=DBF;" + // 此处指定解析文件的后缀
					"SourceDB=" + filePath; // 此处为dbf文件所在的目录
			connDbf = DriverManager.getConnection(DB_URL);
			psDbf = connDbf.prepareStatement(sql);
			psDbf.executeUpdate();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			if (psDbf != null) {
				psDbf.close();
			}
			if (connDbf != null) {
				connDbf.close();
			}
		}
	}

	/**
	 * 用于过滤有下载权限的文件path
	 * 
	 * @param canDownloadFiels
	 *            可以下载文件的信息
	 * @param value
	 *            路径值
	 * @return 可以下载的文件路径
	 */
	public String isContaisFile(
			HashMap<ValueNumber, LinkedHashMap<Field, Value>> canDownloadFiels,
			Value value) {
		StringBuilder files = new StringBuilder();
		if (canDownloadFiels == null || canDownloadFiels.isEmpty()
				|| value == null) {
			return files.toString();
		}
		int count = 1;
		String[] ftpPaths = value.toString().split(";");
		for (String ftpPath : ftpPaths) {
			if (canDownloadFiels.toString().contains(ftpPath)) {
				if (count != 1) {
					files.append(";");
				}
				files.append(ftpPath);
				count++;
			}
		}

		return files.toString();

	}

	/**
	 * liuhezeng 20131213
	 * 
	 * @param sql
	 * @param filePath
	 *            一个目录名称，下面存放ＤＢＦ文件
	 */
	private static void createDBF(String sql, String filePath) throws Exception {
		Connection connDbf = null;
		PreparedStatement psDbf = null;
		try {
			Class.forName("sun.jdbc.odbc.JdbcOdbcDriver");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		try {
			String DB_URL = "jdbc:odbc:Driver={Microsoft FoxPro VFP Driver (*.dbf)};"
					+ // 写法相对固定
					"SourceType=DBF;" + // 此处指定解析文件的后缀
					"SourceDB=" + filePath; // 此处为dbf文件所在的目录
			connDbf = DriverManager.getConnection(DB_URL);
			psDbf = connDbf.prepareStatement(sql);
			psDbf.executeUpdate();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			if (psDbf != null) {
				psDbf.close();
			}
			if (connDbf != null) {
				connDbf.close();
			}
		}
	}

	/**
	 * @author liuhezeng 创建文件
	 * @param filePath
	 */
	private void createFilePath(String filePath) {
		File file = new File(filePath);
		// 如果文件夹不存在则创建
		if (!file.exists() && !file.isDirectory()) {
			file.mkdir();
		}
	}

	public void copy(String originDirectory, String targetDirectory) {
		File origindirectory = new File(originDirectory); // 源路径File实例
		File targetdirectory = new File(targetDirectory); // 目标路径File实例
		if (!origindirectory.isDirectory() || !targetdirectory.isDirectory()) { // 判断是不是正确的路径
			System.out.println("不是正确的目录！");
			return;
		}
		File[] fileList = origindirectory.listFiles(); // 目录中的所有文件
		for (File file : fileList) {
			if (!file.isFile()) // 判断是不是文件
				continue;
			// System.out.println(file.getName());
			try {
				FileInputStream fin = new FileInputStream(file);
				BufferedInputStream bin = new BufferedInputStream(fin);
				PrintStream pout = new PrintStream(
						targetdirectory.getAbsolutePath() + "/"
								+ file.getName());
				BufferedOutputStream bout = new BufferedOutputStream(pout);
				int total = bin.available(); // 文件的总大小
				int percent = total / 100; // 文件总量的百分之一
				int count;
				while ((count = bin.available()) != 0) {
					int c = bin.read(); // 从输入流中读一个字节
					bout.write((char) c); // 将字节（字符）写到输出流中

					if (((total - count) % percent) == 0) {
						double d = (double) (total - count) / total; // 必须强制转换成double
						// System.out.println(Math.round(d*100)+"%"); //输出百分比进度
					}
				}
				bout.close();
				pout.close();
				bin.close();
				fin.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		// System.out.println("End");
	}

	/**
	 * @author liuhezeng 
     * 复制单个文件 
     * @param oldPath String 原文件路径 如：c:/fqf.txt 
     * @param newPath String 复制后路径 如：f:/fqf.txt 
     * @return boolean 
     */ 
   public void copyFile(String oldPath, String newPath) { 
       try { 
           int bytesum = 0; 
           int byteread = 0; 
           File oldfile = new File(oldPath); 
           if (oldfile.exists()) { //文件存在时 
               InputStream inStream = new FileInputStream(oldPath); //读入原文件 
               FileOutputStream fs = new FileOutputStream(newPath); 
               byte[] buffer = new byte[1444]; 
               int length; 
               while ( (byteread = inStream.read(buffer)) != -1) { 
                   bytesum += byteread; //字节数 文件大小 
                   System.out.println(bytesum); 
                   fs.write(buffer, 0, byteread); 
               } 
               inStream.close(); 
           } 
       } 
       catch (Exception e) { 
           System.out.println("复制单个文件操作出错"); 
           e.printStackTrace(); 

       } 

   } 
   
   public void copyFolder(String oldPath, String newPath) { 
     try { 
         (new File(newPath)).mkdirs(); //如果文件夹不存在 则建立新文件夹 
         File a=new File(oldPath); 
         String[] file=a.list(); 
         File temp=null; 
         for (int i = 0; i < file.length; i++) { 
             if(oldPath.endsWith(File.separator)){ 
                 temp=new File(oldPath+file[i]); 
             } 
             else{ 
                 temp=new File(oldPath+File.separator+file[i]); 
             } 
             if(temp.isFile()){ 
                 FileInputStream input = new FileInputStream(temp); 
                 FileOutputStream output = new FileOutputStream(newPath + "/" + 
                         (temp.getName()).toString()); 
                 byte[] b = new byte[1024 * 5]; 
                 int len; 
                 while ( (len = input.read(b)) != -1) { 
                     output.write(b, 0, len); 
                 } 
                 output.flush(); 
                 output.close(); 
                 input.close(); 
             } 
             if(temp.isDirectory()){//如果是子文件夹 
                 copyFolder(oldPath+"/"+file[i],newPath+"/"+file[i]); 
             } 
         } 
     } 
     catch (Exception e) { 
         System.out.println("复制整个文件夹内容操作出错"); 
         e.printStackTrace(); 
     } 
 }
	
	/**
	 * 
	 * @param filepath
	 * @throws IOException
	 */
	public static void del(String filepath) {
		File f = new File(filepath);// 定义文件路径
		if (f.exists() && f.isDirectory()) {// 判断是文件还是目录
			if (f.listFiles().length == 0) {// 若目录下没有文件则直接删除
				f.delete();
			} else {// 若有则把文件放进数组，并判断是否有下级目录
				File delFile[] = f.listFiles();
				int i = f.listFiles().length;
				for (int j = 0; j < i; j++) {
					if (delFile[j].isDirectory()) {
						del(delFile[j].getAbsolutePath());// 递归调用del方法并取得子目录路径
					}
					delFile[j].delete();// 删除文件
				}
			}
		}
	}

	/**
	 * 复写导出DBF类
	 * 
	 * @author liuhezeng 20140512
	 * @param datalist
	 * @param cnumbers
	 * @param esidentifiers
	 * @return 返回导出的参数，格式如({path=20140512111904.dbf, success=true})
	 */

	@SuppressWarnings("unchecked")
	public HashMap exportDBF(List<Map<String, String>> datalist,
			List<String> cnumbers, List<String> esidentifiers,
			HashMap<String, Pair<Integer, String>> pairs) {

		HashMap map = new HashMap();
		String sql = "";
		String address = ""; // 存放文件在服务器的地址
		// 文件存放的路径
		String classPath = this.getClass().getProtectionDomain()
				.getCodeSource().getLocation().getPath();
		String path = classPath.substring(1, classPath.length()).toString();
		int pos = path.indexOf("WEB-INF");
		String web_infPath = path.substring(0, pos);
		String UPLOADED_FILE_PATH = web_infPath + "data/";
		address = UPLOADED_FILE_PATH;
		// 将文件存到服务器指定位置
		Date currentTime = new Date();
		SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		String dateString = formatter.format(currentTime);
		/** 由于DBF文件生成的时候路径较长会生成失败，所以在这里做了一下特殊处理，临时使用一个文件缓存，之后删除文件 **/
		String tempPath = "E:\\flyingsoftTmpFiles\\"+dateString+"\\";
		createFilePath(tempPath);
		String fileName = (tempPath + dateString + ".dbf");

		String finalPath = address.replaceAll("/", "\\\\");
		createFilePath(finalPath);
		// String finalfileName = (address + "" + dateString +
		// ".dbf").replaceAll(
		// "/", "\\\\");
		// String tempPath = "E:\\apache-tomcat-7.0.50-windows-x86";
		// String fileName = (tempPath + "\\" + dateString +
		// ".dbf").replaceAll("/", "\\\\");

		// 分别定义各个字段信息，setFieldName和setName作用相同，(写出dbf文件的列名 )
		try {
			StringBuffer createSQL = new StringBuffer("create table "
					+ fileName + " (");
			for (int i = 0; i < cnumbers.size(); i++) {
				if (i == 0) {
					createSQL.append("id N,");
				}
				String str =  cnumbers.get(i);// 写出文件头时过滤掉附加的后缀
				if (str.contains("Is_@Resouce#~Data*0Type")) {
					str = str.replace("Is_@Resouce#~Data*0Type", "");
				}
				// ninglong20110429 修改dbf
				// Pair<Integer, String> pair = tagMap.get(str);
				Pair<Integer, String> pair = pairs.get("C"+esidentifiers.get(i));
				if (pair != null) {
					if (str.matches("^[\u4e00-\u9fa5]{0,}$")
							&& str.length() > 5) {// 如果是中文，就只要前5个字 ninglong
						// 原因是dbf文件的列名只支持最多10个字符
						createSQL.append(str.substring(0, 5)).append(" ");
					} else {
						createSQL.append(str).append(" ");
					}
					if (TYPE.NUMBER.toString().equals(pair.right + "")) {// 目前写死
						// 整型
						// 浮点型
						// 字符型
						// ninglong
						// 动态写入dbf的类型与长度
						// createSQL.append("number(").append(pair.a +
						// "").append("),");
						createSQL.append("N").append(",");
					} else if (TYPE.FLOAT.toString().equals(pair.right + "")) {
						// createSQL.append("float(").append(pair.a +
						// "").append("),");
						createSQL.append("F,");
					} else if (TYPE.DATE.toString().equals(pair.right + "")) {// 日期型不能设置长度fields[i].setFieldLength(DBFField.FIELD_TYPE_D);
						createSQL.append("D,");
						// 20110510
						// 修改
						// 日期不设置长度
					} else {// zhangyuan 20130906 处理长度大于255的，dbf长度最大为255

						if (Integer.parseInt(pair.left + "") >= 128) {
							createSQL.append("M,");
						} else {
							createSQL.append("C(").append(pair.left + "")
									.append("),");
						}
					}
				}
				// else {// 特殊处理 【正文】【附件】【处理单】
				// createSQL.append("memo,");
				// }
			}
			sql = createSQL.toString().substring(0,
					createSQL.toString().lastIndexOf(","))
					+ ")";
		} catch (Exception e) {
			e.printStackTrace();
		}
		try {
			// tempPath = "E:\\DBFData";
			// 把字段信息写入DBFWriter实例，即定义表结构
			createDBF(sql, tempPath);
			// 一条条的写入记录
			// Iterator idKeyIt = idAndPkgMap.keySet().iterator();
			/** 行计算器，用来修正一行中字段大于256字段时候修复异常，使用update语句更新 **/
			int row = 1;
			HashMap<String, LinkedHashMap<String, String>> tempUpdateDatas = new HashMap<String, LinkedHashMap<String, String>>();
			for (Map pkgMapTemp : datalist) {
				StringBuffer insertSQL = new StringBuffer("insert into "
						+ fileName + " values(");

				Object[] rowData = new Object[cnumbers.size()];
				List<String> downloadFiles = new ArrayList<String>();
				LinkedHashMap<String, String> tmpColumsDates = new LinkedHashMap<String, String>();
				for (int j = 0; j < rowData.length; j++) {
					if (j == 0) {
						insertSQL.append(row + ",");
					}
					// 根据键获取值
					// -------------------------------------------------------------liuqiang
					// 20100209 解决无数据时引起的空指针错误
//					Value v = null;
					Pair<Integer, String> pair = pairs.get("C"+esidentifiers.get(j));
					Object ob = pkgMapTemp.get( "C"+esidentifiers.get(j));
					Object resourcePath = pkgMapTemp.get(new Field("原文路径"));
//					if (null != ob) {
//						v = Value.toValue(Value.TYPE.TEXT, ob.toString().replaceAll("\n", "").replaceAll("\r", ""));
//					}
//					if (null == v)
//						v = new ValueText("");
					// ninglong20110429 修改
					// Pair pair = tagMap.get(columns[j]);
					if (pair != null) {
						if (TYPE.NUMBER.toString().equals(pair.right + "")) {// 目前写死
							// 整型
							// 浮点型
							// 字符型
							// 日期
							// 下面强转成Double是由于jar本身只支持
							// ninglong20110328
							insertSQL.append(
									""
											+ ((ob == null || "".equals(ob
													.toString())) ? Double
													.valueOf(0) : Double
													.valueOf(ob.toString())))
									.append(",");
						} else if (TYPE.FLOAT.toString()
								.equals(pair.right + "")) {
							insertSQL.append(
									""
											+ ((ob == null || "".equals(ob
													.toString())) ? Double
													.valueOf(0.0) : Double
													.valueOf(ob.toString())))
									.append(",");
						} else if (TYPE.DATE.toString().equals(pair.right + "")) {

							/** liuhezeng 20131220 处理特殊的日期型 **/
							try {
								Date date = new Date();
								SimpleDateFormat formatter1 = new SimpleDateFormat(
										"{^yyyy-mm-dd}");
								insertSQL
										.append(""
												+ ((ob == null || "".equals(ob
														.toString())) ? formatter1
														.format(date)
														: DateUtil
																.convertStringToDateForDBF(
																		"{^yyyy-mm-dd}",
																		ob.toString())))
										.append(",");
							} catch (ParseException e) {
								e.printStackTrace();
							}

						} else {
							/** 添加foxpro长度大于200的处理 **/
							if (null != ob && ob.toString().length() > 122) {
								insertSQL.append("'',");
								tmpColumsDates.put( cnumbers.get(j),
										ob.toString().replaceAll("\n", "").replaceAll("\r", ""));
							} else {
								insertSQL.append("'"
										+ (ob == null ? "" : ob.toString().replaceAll("\n", "").replaceAll("\r", ""))
										+ "',");
							}
						}
					}
				}
				sql = insertSQL.toString().substring(0,
						insertSQL.toString().lastIndexOf(","))
						+ ")";
				tempUpdateDatas.put(String.valueOf(row), tmpColumsDates);
				row++;
				createDBF(sql, tempPath);
			}
			if (tempUpdateDatas.size() > 0) {
				updateDBF(fileName, tempUpdateDatas, tempPath);
			}
		} catch (DBFException e) {
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		map.put("path", dateString);
//		ZipUtil zu = new ZipUtil();
		String delPath = tempPath.substring(0,tempPath.indexOf(dateString));
//		try {
//				zu.createZip(delPath+dateString+".zip",tempPath);
//			} catch (java.lang.Exception e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}
		copyFolder(tempPath, finalPath+"/"+dateString);
		del(delPath);
//		map.put("success", true);
//		map.put("path", dateString+".zip");
		return map;

	}
	
	/**
	 * 用javadbf实现dbf导出
	 * @author wanghongchen 20141014
	 * @param datalist
	 * @param cnumbers
	 * @param esidentifiers //表字段名 集合
	 * @param pairs
	 * @return
	 */
	public HashMap exportDBFNew(List<Map<String, String>> datalist, List<String> cnumbers,
        List<String> esidentifiers,HashMap<String,Pair<Integer, String>> pairs) {
      HashMap map = new HashMap();
      Boolean flag = false;
      String address = ""; // 存放文件在服务器的地址
      // 文件存放的路径
      String classPath =
          this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
      String path = "/" + classPath.toString();
      int pos = path.indexOf("WEB-INF");
      String web_infPath = path.substring(0, pos);
      String UPLOADED_FILE_PATH = web_infPath + "data/";
      address = UPLOADED_FILE_PATH;
      OutputStream fos = null;
      try {
        DBFField[] fields = new DBFField[esidentifiers.size()];
        // 产生表格标题行
        for (int i = 0; i < esidentifiers.size(); i++) {
          fields[i] = new DBFField();
          if (esidentifiers.get(i).matches("^[\u4e00-\u9fa5]{0,}$")
              && esidentifiers.get(i).length() > 5) {// 如果是中文，就只要前5个字，原因是dbf文件的列名只支持最多10个字符
            fields[i].setName(esidentifiers.get(i).substring(0, 5));
          } else {
            fields[i].setName(esidentifiers.get(i));
          }
          Pair<Integer, String> pair = pairs.get("C"+cnumbers.get(i));
          if (VALUETYPES.convertTagType(TYPE.NUMBER.toString()).equals(pair.right)) {
            fields[i].setDataType(DBFField.FIELD_TYPE_N);
            fields[i].setFieldLength(pair.left);
          } else if (VALUETYPES.convertTagType(TYPE.FLOAT.toString()).equals(pair.right)) {
            fields[i].setDataType(DBFField.FIELD_TYPE_F);
            fields[i].setFieldLength(pair.left);
          } else if (VALUETYPES.convertTagType(TYPE.DATE.toString()).equals(pair.right)) {// 日期型不能设置长度
            fields[i].setDataType(DBFField.FIELD_TYPE_D);
          } else {
            fields[i].setDataType(DBFField.FIELD_TYPE_C);
            if(pair.left > 255){
              fields[i].setFieldLength(255);
            }else{
              fields[i].setFieldLength(pair.left);
            }
          }
        }
        DBFWriter writer = new DBFWriter();
        writer.setCharactersetName("GBK");
        // 把字段信息写入DBFWriter实例，即定义表结构
        writer.setFields(fields);
        int columns = esidentifiers.size(); // 设置总的列数的宽度
        int rownum = datalist.size(); // 表格的行的长度
        // 写入datalist中的数据
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for (int i = 0; i < rownum; i++) {
          Object[] rowData = new Object[columns];
          for (int j = 0; j < columns; j++) {
            String ob = datalist.get(i).get("C" + cnumbers.get(j));
            Pair<Integer, String> pair = pairs.get("C"+cnumbers.get(j));
            if (VALUETYPES.convertTagType(TYPE.NUMBER.toString()).equals(pair.right)) {
              rowData[j] = (ob == null || "".equals(ob.toString())) ? Double.valueOf(0) : Double.valueOf(ob.toString());
            } else if (VALUETYPES.convertTagType(TYPE.FLOAT.toString()).equals(pair.right)) {
              rowData[j] = (ob == null || "".equals(ob.toString())) ? Double.valueOf(0.0) : Double.valueOf(ob.toString());
            } else if (VALUETYPES.convertTagType(TYPE.DATE.toString()).equals(pair.right)) {// 日期型不能设置长度
              rowData[j] = (ob == null || "".equals(ob.toString())) ? new Date() : sdf.parse(ob);
            } else {
              if(ob == null){
                rowData[j] = "";
              }else{
                /** wanghongchen 20141016 如果是中文，截取钱127个汉字 **/
                if(ob.matches("^[\u4e00-\u9fa5]{0,}$") && ob.length() > 127){
                  rowData[j] = ob.substring(0, 127);
                }else if(ob.length() > 255){
                  rowData[j] = ob.substring(0, 255);
                }else{
                  rowData[j] = ob;
                }
              }
            }
          }
          writer.addRecord(rowData);
        }
        // 将文件存到服务器指定位置
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String dateString = formatter.format(currentTime);
        /** xiaoxiong 20141016 判断路径是否存在 不存在时 将其创建 **/
        File dir = new File(address + "" + dateString) ;
        if(!dir.exists()){
        	dir.mkdirs() ;
        }
        fos = new FileOutputStream(address + "" + dateString + ".dbf");
        // 写入数据
        writer.write(fos);
        flag = true;
        map.put("success", flag);
        map.put("path", dateString + ".dbf");
      } catch (DBFException e) {
        flag = false;
        e.printStackTrace();
      } catch (FileNotFoundException e) {
        flag = false;
        e.printStackTrace();
      } catch (ParseException e) {
        flag = false;
        e.printStackTrace();
      } catch (UnsupportedEncodingException e) {
      	flag = false;
  		e.printStackTrace();
  	  } finally {
        try {
          fos.close();
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
      return map;
    }
	/**
	 * 20150112 xiewenda
	 * 重载exportDBFNew 方法 （文控系统）
	 * @param datalist 需要导出的数据
	 * @param fieldList 数据的中的字段信息
	 * @param pairs 表字段的定义信息(类型 长度...)
	 * @return
	 */
	public String exportDBFNew(List<Map<String, Object>> datalist, List<Map<String,Object>> fieldList, Map<String,Pair<Integer, String>> pairs) {
      String address = ""; // 存放文件在服务器的地址
      // 文件存放的路径
      String classPath =
          this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
      String path = "/" + classPath.toString();
      int pos = path.indexOf("WEB-INF");
      String web_infPath = path.substring(0, pos);
      String UPLOADED_FILE_PATH = web_infPath + "data/";
      address = UPLOADED_FILE_PATH;
      OutputStream fos = null;
      try {
        DBFField[] fields = new DBFField[fieldList.size()];
        // 产生表格标题行
        for (int i = 0; i < fieldList.size(); i++) {
          fields[i] = new DBFField();
          String name = fieldList.get(i).get("name").toString();
          String code = fieldList.get(i).get("code").toString();
          
          // lujixiang 列名只支持10个字节长度，javadbf默认以gbk编码存储列名,如果列名包含中文字符，为了方便，默认直接截取前5个字符
          if (name.matches("^[\u4e00-\u9fa5]{0,}$")
              && name.length() > 5) {
            fields[i].setName(name.substring(0, 5));
          } else {
        	// 截取10个字节长度 
        	name = 10 < name.length()  ?  name.substring(0,10) : name ;
            fields[i].setName(name);
          }
          Pair<Integer, String> pair = pairs.get(code);
          if (VALUETYPES.convertTagType(TYPE.NUMBER.toString()).equals(pair.right)) {
            fields[i].setDataType(DBFField.FIELD_TYPE_N);
            fields[i].setFieldLength(pair.left);
          } else if (VALUETYPES.convertTagType(TYPE.FLOAT.toString()).equals(pair.right)) {
            fields[i].setDataType(DBFField.FIELD_TYPE_F);
            fields[i].setFieldLength(pair.left);
          } else if (VALUETYPES.convertTagType(TYPE.DATE.toString()).equals(pair.right)) {// 日期型不能设置长度
            fields[i].setDataType(DBFField.FIELD_TYPE_D);
          } else {
            fields[i].setDataType(DBFField.FIELD_TYPE_C);
            if(pair.left > 255){
              fields[i].setFieldLength(255);
            }else{
              fields[i].setFieldLength(pair.left);
            }
          }
        }
        DBFWriter writer = new DBFWriter();
        writer.setCharactersetName("GBK");
        // 把字段信息写入DBFWriter实例，即定义表结构
        writer.setFields(fields);
        int columns = fieldList.size(); // 设置总的列数的宽度
        int rownum = datalist.size(); // 表格的行的长度
        // 写入datalist中的数据
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for (int i = 0; i < rownum; i++) {
          Object[] rowData = new Object[columns];
          for (int j = 0; j < columns; j++) {
            String code = fieldList.get(j).get("code").toString();
            Object ob = datalist.get(i).get(code);
            Pair<Integer, String> pair = pairs.get(code);
            if (VALUETYPES.convertTagType(TYPE.NUMBER.toString()).equals(pair.right)) {
              rowData[j] = (ob == null || "".equals(ob.toString())) ? Double.valueOf(0) : Double.valueOf(ob.toString());
            } else if (VALUETYPES.convertTagType(TYPE.FLOAT.toString()).equals(pair.right)) {
              rowData[j] = (ob == null || "".equals(ob.toString())) ? Double.valueOf(0.0) : Double.valueOf(ob.toString());
            } else if (VALUETYPES.convertTagType(TYPE.DATE.toString()).equals(pair.right)) {// 日期型不能设置长度
              rowData[j] = (ob == null || "".equals(ob.toString())) ? new Date() : sdf.parse(ob.toString());
            } else {
              if(ob == null){
                rowData[j] = "";
              }else{
               String obstr= ob.toString();
                /** wanghongchen 20141016 如果是中文，截取钱127个汉字 **/
                if(obstr.matches("^[\u4e00-\u9fa5]{0,}$") && obstr.length() > 127){
                  rowData[j] = obstr.substring(0, 127);
                }else if(obstr.length() > 255){
                  rowData[j] = obstr.substring(0, 255);
                }else{
                  rowData[j] = ob;
                }
              }
            }
          }
          writer.addRecord(rowData);
        }
        // 将文件存到服务器指定位置
        Date currentTime = new Date();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String dateString = formatter.format(currentTime);
        File dir = new File(address + "" + dateString) ;
        if(!dir.exists()){
            dir.mkdirs() ;
        }
        fos = new FileOutputStream(address + "" + dateString + ".dbf");
        // 写入数据
        writer.write(fos);
        return dateString + ".dbf";
      } catch (DBFException e) {
        e.printStackTrace();
      } catch (FileNotFoundException e) {
        e.printStackTrace();
      } catch (ParseException e) {
        e.printStackTrace();
      } catch (UnsupportedEncodingException e) {
  		// TODO Auto-generated catch block
  		e.printStackTrace();
  	  } finally {
        try {
          if(fos!=null)
            fos.close();
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
      return null;
    }
	
	 public static void main(String[] args) throws DBFException, UnsupportedEncodingException {
	    DBFField fields[] = new DBFField[3]; 

	    fields[0] = new DBFField();  //new String(.getBytes("gbk"),"GBK")
	    fields[0].setName("哈哈哈"); 
	    fields[0].setDataType( DBFField.FIELD_TYPE_C); 
	    fields[0].setFieldLength(10); 

	    fields[1] = new DBFField(); 
	    fields[1].setName( "emp_name"); 
	    fields[1].setDataType( DBFField.FIELD_TYPE_C); 
	    fields[1].setFieldLength(20); 

	    fields[2] = new DBFField(); 
	    fields[2].setName( "salary"); 
	    fields[2].setDataType( DBFField.FIELD_TYPE_N); 
	    fields[2].setFieldLength( 12); 
	    fields[2].setDecimalCount( 2); 

	    DBFWriter writer = new DBFWriter(); 
	    writer.setCharactersetName("GBK"); 
	    writer.setFields( fields); 

	    // now populate DBFWriter 
	    // 

	    Object rowData[] = new Object[3]; 
	    rowData[0] = "1000"; 
	    rowData[1] = "一二三四五六"; 
	    rowData[2] = new Double( 5000.00); 

	    writer.addRecord( rowData); 

	    rowData = new Object[3]; 
	    rowData[0] = "1001"; 
	    rowData[1] = "一二三四五六"; 
	    rowData[2] = new Double( 3400.00); 

	    writer.addRecord( rowData); 

	    rowData = new Object[3]; 
	    rowData[0] = "1002"; 
	    rowData[1] = "一二三四五六"; 
	    rowData[2] = new Double( 7350.00); 

	    writer.addRecord( rowData); 

	    OutputStream fos = null;
      try {
        fos = new FileOutputStream("d:/data/testdbf.dbf");
      } catch (FileNotFoundException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      } 
	    writer.write(fos); 
	    try {
        fos.close();
      } catch (IOException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      } 
	  }
}
