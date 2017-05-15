package cn.flying.rest.service.utils;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.lucene.search.Query;
import org.apache.lucene.search.highlight.Fragmenter;
import org.apache.lucene.search.highlight.Highlighter;
import org.apache.lucene.search.highlight.QueryScorer;
import org.apache.lucene.search.highlight.SimpleFragmenter;
import org.apache.lucene.search.highlight.SimpleHTMLFormatter;




/**
 * 
 * @author zhanglei 20131205
 *
 */
public class TextFormater {
	public static final String prefixHTML = "<font color='red'>";
	public static final String suffixHTML = "</font>";
	public static final int fragCharSize = 20;
	
	protected static Highlighter getHighlighter(Query query){
		SimpleHTMLFormatter simpleHTMLFormatter = new SimpleHTMLFormatter(prefixHTML, suffixHTML);
		Highlighter highlighter = new Highlighter(simpleHTMLFormatter, new QueryScorer(query));
		Fragmenter fragmenter = new SimpleFragmenter(fragCharSize);//片断大小
		highlighter.setTextFragmenter(fragmenter);
		return highlighter;
	}
	
	/**
	 * 去除两头空格、标点
	 */
	private static final Pattern punctPattern = Pattern.compile("^[\\pP\\s\\p{Zs}]+|[\\pP\\s\\p{Zs}]+$");//线程安全
	protected static String trimPunctuation(String str){
		Matcher m = punctPattern.matcher(str);
		StringBuffer sb = new StringBuffer();
		while(m.find()){
			//System.out.println(m.group());
			m.appendReplacement(sb, "");
		}
		m.appendTail(sb);
		sb.append("...");
		return sb.toString();
	}
	
	/**
	 * 获取关键词高亮匹配正则
	 */
	private static final String numberRegEx = "^\\d+$";
	public static Map<String, KeywordPattern> getKeywordPattern(List<String> keywordList){
		Map<String, KeywordPattern> map = new HashMap<String, KeywordPattern>();
		for(String keyword : keywordList){
			if(Pattern.matches(numberRegEx, keyword)){
				String numRegEx = new StringBuilder().append("^").append(keyword).append("$")
					.append("|^").append(keyword).append("\\D")
					.append("|\\D").append(keyword).append("\\D")
					.append("|\\D").append(keyword).append("$")
					.toString();
				map.put(keyword, new KeywordPattern(true, Pattern.compile(numRegEx)));
			}else{
				map.put(keyword, new KeywordPattern(false, Pattern.compile(keyword, Pattern.LITERAL)));
			}
		}
		return map;
	}
	
	/**
	 * 创建高亮文本，不包含高亮则返回null
	 */
	public static String createHighlightedText(String text, Map<String, KeywordPattern> keywordPatternMap){
		boolean highlighted = false;
		Iterator<Map.Entry<String, KeywordPattern>> iter = keywordPatternMap.entrySet().iterator();
		while(iter.hasNext()){
			Map.Entry<String, KeywordPattern> entry = iter.next();
			String keyword = entry.getKey();
			if(!keyword.equals(keyword.toUpperCase())){
				/** xiaoxiong 20140819 添加英文大小写不区分都标红相关代码 **/
				keyword = keyword.toUpperCase() ;
				String value = text.toUpperCase() ;
				if(value.indexOf(keyword)>-1){
					StringBuffer sb = new StringBuffer();
					int end = 0;
					int limit = keyword.length() ;
					while(value.indexOf(keyword)>-1){
						end = value.indexOf(keyword);
						sb.append(text.substring(0, end)) ;
						sb.append(prefixHTML).append(text.substring(end, end+limit)).append(suffixHTML) ;
						value = value.substring(end+limit);
						text = text.substring(end+limit);
						if(value.indexOf(keyword)==-1){
						  if(!"".equals(text) && text!=null){
						    //xiewenda 20150601 这里原来为text.substring(end+limit) 可能抛下标越界异常 改为这样
							sb.append(text.substring(text.length())) ;
						  }
						  break ;
						}
					}
					text = sb.toString();
					highlighted = true;
				}
				if(!highlighted){
					keyword = keyword.toLowerCase() ;
					value = text.toLowerCase() ;
					if(value.indexOf(keyword)>-1){
						StringBuffer sb = new StringBuffer();
						int end = 0;
						int limit = keyword.length() ;
						while(value.indexOf(keyword)>-1){
							end = value.indexOf(keyword);
							sb.append(text.substring(0, end)) ;
							sb.append(prefixHTML).append(text.substring(end, end+limit)).append(suffixHTML) ;
							value = value.substring(end+limit);
							text = text.substring(end+limit);
							if(value.indexOf(keyword)==-1){
	                          if(!"".equals(text) && text!=null){
	                            sb.append(text.substring(end+limit)) ;
	                          }
	                          break ;
	                        }
						}
						text = sb.toString();
						highlighted = true;
					}
				}
			} else {
				if(entry.getValue().numerical){
					Matcher m = entry.getValue().pattern.matcher(text);
					StringBuffer sb = new StringBuffer();
					while(m.find()){
						m.appendReplacement(sb, m.group().replaceAll(keyword, prefixHTML + keyword + suffixHTML));
						highlighted = true;
					}
					m.appendTail(sb);
					text = sb.toString();
				}else{
					Matcher m = entry.getValue().pattern.matcher(text);
					StringBuffer sb = new StringBuffer();
					while(m.find()){
						m.appendReplacement(sb, prefixHTML + keyword + suffixHTML);
						highlighted = true;
					}
					m.appendTail(sb);
					text = sb.toString();
				}
			}
		}
		if(highlighted) return text;
		return null;
	}
	
	protected static class KeywordPattern {
		boolean numerical;
		Pattern pattern;
		KeywordPattern(boolean numerical, Pattern pattern){
			this.numerical = numerical;
			this.pattern = pattern;
		}
	}
}
