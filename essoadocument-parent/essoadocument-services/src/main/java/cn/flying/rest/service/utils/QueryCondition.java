package cn.flying.rest.service.utils;

import java.util.List;
import java.util.Map;

/**
 * 查询条件（按省）
 * @author zhanglei 20131028
 *
 */
public class QueryCondition implements java.io.Serializable{
	private static final long serialVersionUID = -6460632859721174198L;

	private Map<String,List<String>> mainSiteMap;//value:companyOrgList
	private Map<String,List<String>> companyOrgMap;//value:deptOrgList
	private String searchWord;
	private List<ConditionEntry> condEntryList;
	private boolean totalOnly;
	
	public Map<String, List<String>> getMainSiteMap() {
		return mainSiteMap;
	}
	public void setMainSiteMap(Map<String, List<String>> mainSiteMap) {
		this.mainSiteMap = mainSiteMap;
	}
	public Map<String, List<String>> getCompanyOrgMap() {
		return companyOrgMap;
	}
	public void setCompanyOrgMap(Map<String, List<String>> companyOrgMap) {
		this.companyOrgMap = companyOrgMap;
	}
	public String getSearchWord() {
		return searchWord;
	}
	public void setSearchWord(String searchWord) {
		this.searchWord = searchWord;
	}
	public List<ConditionEntry> getCondEntryList() {
		return condEntryList;
	}
	public void setCondEntryList(List<ConditionEntry> condEntryList) {
		this.condEntryList = condEntryList;
	}
	public boolean isTotalOnly() {
		return totalOnly;
	}
	public void setTotalOnly(boolean totalOnly) {
		this.totalOnly = totalOnly;
	}
	
}
