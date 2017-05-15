package cn.flying.rest.service.utils;

/**
 * 中央服务与边缘索引服务交互参数
 * @author zhanglei 20131120
 *
 */
public class SearchEnum {
	
	//标题（包含高亮样式）
	public static final String Key_H_title = "h_title";
	//摘要（包含高亮样式）
	public static final String Key_H_snippet = "h_snippet";
	//著录项（包含高亮样式）key前缀
	public static final String Key_H_metadata_prefix = "h_";//文件级
	public static final String Key_P_H_metadata_prefix = "p_h_";//案卷级
}
