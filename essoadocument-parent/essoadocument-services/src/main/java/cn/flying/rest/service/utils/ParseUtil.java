package cn.flying.rest.service.utils;




/**
 * @see 判断文件的格式和版本的工具类
 * @author yanggaofei 20120919
 *
 */
public class ParseUtil {
		
	
	/**
	 * 判断Excel文件是否是03的版本
	 * @author yanggaofei 20120919
	 * @param filePath 文件路径
	 * @return 若是03版本返回true 否则返回false
	 */
	public static Boolean isExcel2003(String filePath){
		
		return filePath.toString().matches("^.+\\.(?i)(xls)$");
		
	}
	/**
	 * 判断Excel文件是否为07版本
	 * @author yanggaofei 20120919
	 * @param filePath 文件路径
	 * @return 是返回true 不是返回false
	 */
	public static Boolean isExcel2007(String filePath){
		return filePath.toString().matches("^.+\\.(?i)(xlsx)$");
	}
	
	
	/**
	 * 判断文件是否是dbf文件
	 * @author yanggaofei 20120925
	 * @param filePath 文件路径
	 * @return 若是dbf返回true 否则返回false
	 */
	public static Boolean isDBF(String filePath){
		
		return filePath.toString().matches("^.+\\.(?i)(dbf)$");
		
	}
	
	
	/**
	 * 判断文件是否是Excel文件
	 * @author yanggaofei 20120919
	 * @param fileName 文件名称（a.xls）
	 * @return 是返回true 不是返回false
	 */
	public  static Boolean verifyExcel(String fileName){
	
	/** 检查文件名是否为空或者是否是Excel格式的文件 */  
	  
		if (fileName == null || !(ParseUtil.isExcel2003(fileName) || ParseUtil.isExcel2007(fileName))){  
			System.out.println("文件名不是excel格式"); ;  
            return false;  
			}  
//        /** 检查文件是否存在 */  
//        File file = new File(fileName.toString());  
//        if (file == null || !file.exists()) {  
//    		System.out.println("文件不存在");;  
//    		return false;  
//	        }  
//	  
        return true;  
		
	}	
	
	
}
