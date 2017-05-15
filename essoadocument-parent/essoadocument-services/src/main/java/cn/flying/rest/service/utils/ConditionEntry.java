package cn.flying.rest.service.utils;

import java.util.List;

/**
 * 查询条件
 * @author zhanglei 20131028
 *
 */
public class ConditionEntry implements java.io.Serializable{
	private static final long serialVersionUID = 4379559249571386251L;

	private String fieldName;
	private String singleValue;//档案类型
	private List<String> multiValues;//范围、多值查询使用
	private Integer compareType;//CompareType  查询关系
	private Integer occurType;//OccurType  并且 或者  非
	
	public ConditionEntry() {
		super();
	}
	
	public ConditionEntry(String fieldName, String singleValue, Integer compareType, Integer occurType) {
		super();
		this.fieldName = fieldName;
		this.singleValue = singleValue;
		this.compareType = compareType;
		this.occurType = occurType;
	}
	
	public ConditionEntry(String fieldName, List<String> multiValues, Integer compareType, Integer occurType) {
		super();
		this.fieldName = fieldName;
		this.multiValues = multiValues;
		this.compareType = compareType;
		this.occurType = occurType;
	}

	@Override
	public String toString() {
		return new StringBuilder().append("fieldName=").append(fieldName)
				.append(", singleValue=").append(singleValue)
				.append(", multiValues=").append(multiValues)
				.append(", compareType=").append(compareType).toString();
	}

	public String getFieldName() {
		return fieldName;
	}
	public void setFieldName(String fieldName) {
		this.fieldName = fieldName;
	}
	public String getSingleValue() {
		return singleValue;
	}
	public void setSingleValue(String singleValue) {
		this.singleValue = singleValue;
	}
	public List<String> getMultiValues() {
		return multiValues;
	}
	public void setMultiValues(List<String> multiValues) {
		this.multiValues = multiValues;
	}
	public Integer getCompareType() {
		return compareType;
	}
	public void setCompareType(Integer compareType) {
		this.compareType = compareType;
	}
	public Integer getOccurType() {
		return occurType;
	}
	public void setOccurType(Integer occurType) {
		this.occurType = occurType;
	}

	public static class CompareType {
		public static final int EQUAL = 1;         //等于
		/*
		public static final int GREATER = 2;       //大于
		public static final int LESSER = 3;        //小于
		public static final int GREATER_EQUAL = 4; //大于等于
		public static final int LESSER_EQUAL = 5;  //小于等于
		public static final int UNEQUAL = 6;       //不等于
		*/
		public static final int LIKE = 21;       //模糊查询
		
		public static final int RANGE = 31;      //范围查询
		
		public static final int MULTIPLE = 41;   //多值查询
		
		public static final int PARTICIPLE = 51; //分词查询
	}
	public static class OccurType {
		public static final int MUST = 1;//并且
		public static final int SHOULD = 2;//或者
		public static final int MUST_NOT = 3;//非
	}
}
