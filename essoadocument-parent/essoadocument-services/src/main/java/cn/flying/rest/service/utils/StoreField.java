package cn.flying.rest.service.utils;




/**
 * 索引字段（特殊前缀分类）
 * @author zhanglei 20131018
 *
 */
public class StoreField {
	public static final String item_string_prefix = "s_";//系统字段名前缀（不分词）
	public static final String item_text_prefix = "t_";//分词字段名前缀
	public static final String item_metadata_prefix = "m_";//元数据字段名前缀
	
	public static final String parent_string_prefix = "p_s_";//案卷系统字段名前缀
	public static final String parent_text_prefix = "p_t_";//案卷分词字段名前缀
	public static final String parent_metadata_prefix = "p_m_";//案卷元数据字段名前缀
	
	//系统字段
	public static final String S_taskId = item_string_prefix + "taskId";
	public static final String S_taskTime = item_string_prefix + "taskTime";
	public static final String S_entityId = item_string_prefix + "entityId";//espath
	public static final String S_struId = item_string_prefix + "struId";//结构ID
	public static final String S_itemId = item_string_prefix + "itemId";//表记录ID
	public static final String S_entityClass = item_string_prefix + "entityClass";//档案类型
	public static final String S_entityClassName = item_string_prefix + "entityClassName";
	public static final String S_mainSite = item_string_prefix + "mainSite";//省份简码
	public static final String S_companyOrgId = item_string_prefix + "companyOrgId";//地市公司ID
	public static final String S_deptOrgId = item_string_prefix + "deptOrgId";//部门ID
	public static final String S_ctrlusing = item_string_prefix + "ctrlusing";//是否限制利用
	
	public static final String S_attachments = item_string_prefix + "attachments";//附件数（索引特定类型附件）
	public static final String S_fileId = item_string_prefix + "fileId";//文本文件ID
	public static final String S_filePath = item_string_prefix + "filePath";//文本文件文件夹（相对根路径）
	//元数据字段（枚举部分，其他按规则同理）
		public static final String M_RecordId = item_metadata_prefix + MetadataEnum.RecordID;
		public static final String M_Title = item_metadata_prefix + MetadataEnum.Title;
		public static final String M_Summary = item_metadata_prefix + MetadataEnum.Summary;
		public static final String M_ArchivalCode = item_metadata_prefix + MetadataEnum.ArchivalCode;
		public static final String M_Year = item_metadata_prefix + MetadataEnum.Year;
	//..
	
	//大文本字段（分词）
	public static final String T_label = item_text_prefix + "label";//元数据合并信息
	public static final String T_content = item_text_prefix + "content";//文件索引
	public static final String T_FJ_content = item_text_prefix + "FJcontent";//文件索引
	public static final String T_CLD_content = item_text_prefix + "CLDcontent";//文件索引
	
	public static final String DOCUMENTFLAG = item_string_prefix + "documentflag";//xiaoxiong 20140805 是否存在电子文件标示
	public static final String STRUCTURETYPE = item_string_prefix + "structureType";//xiaoxiong 20140930 添加结构类型标示 innerFile/file
	
	//以下添加案卷结构字段
	public static final String P_T_label = parent_text_prefix + "label";//案卷元数据合并信息
	
	//案卷系统字段
	public static final String P_S_entityId = parent_string_prefix + "entityId";
	public static final String P_S_struId = parent_string_prefix + "struId";//案卷结构ID
	public static final String P_S_bundleId = parent_string_prefix + "bundleId";//案卷ID relation

	//案卷元数据字段（枚举部分，其他按规则同理）
	public static final String P_M_Title = parent_metadata_prefix + MetadataEnum.Title;
	public static final String P_M_Summary = parent_metadata_prefix + MetadataEnum.Summary;
	public static final String P_M_ArchivalCode = parent_metadata_prefix + MetadataEnum.ArchivalCode;
}
