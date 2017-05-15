package cn.flying.rest.service.utils;

import java.util.HashMap;
import java.util.Map;

/**
 * 
 *
 */
public class FulltextWriter {
	private static FulltextWriter instance = new FulltextWriter();
	/**
	 * 为了给indexStoreWSImpl用，改成public
	 * @return
	 */
	public static FulltextWriter getInstance(){
		return instance;
	}
	
	//key：模块
	private Map<String,ModuleWriteManager> managerMap = new HashMap<String,ModuleWriteManager>();
	/**
	 * 获取ModuleWriteManager
	 * 删除索引库，优化索引库使用
	 * @param module
	 * @return
	 * @throws Exception
	 */
	public ModuleWriteManager getModuleWriteManager(String module, String treeNodeId) throws Exception{
      ModuleWriteManager writeManager = managerMap.get(treeNodeId+"_"+module);
      return writeManager;
    }
}
