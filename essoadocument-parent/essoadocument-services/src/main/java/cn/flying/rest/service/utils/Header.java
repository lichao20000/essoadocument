package cn.flying.rest.service.utils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * @author huying
 *
 */
public class Header implements Serializable{
  private static final long serialVersionUID = 1L;
    private String name ;
    private int maxLength ;
    private int minLength = 50000000 ;
    private List<Integer> types = new ArrayList<Integer>() ;
    private boolean isContainsSpecialChar ;
    private boolean validateResult ;
    private boolean isNull = true ;
    public boolean isValidateResult() {
        return validateResult;
    }

    public boolean isContainsSpecialChar() {
        return isContainsSpecialChar;
    }

    public void setValidateResult(boolean validateResult) {
        this.validateResult = validateResult;
    }

    public int getMaxLength() {
        return maxLength;
    }
    
    public void resetLength(int length){
        setMinLength(length) ;
        setMaxLength(length) ;
    }
    
    public void resetType(int type){
        if(!types.contains(type)){
            types.add(type) ;
        }
    }
    
    public void resetIsNull(boolean isNull){
        this.isNull = this.isNull && isNull ;
    }
    
    public void resetType(String type){
        if("文本".equals(type)){
            resetType(ValueType.TEXT.ordinal()) ;
        } else if("日期".equals(type)){
            resetType(ValueType.DATE.ordinal()) ;
        } else if("时间".equals(type)){
            resetType(ValueType.TIME.ordinal()) ;
        } else if("数值".equals(type)){
            resetType(ValueType.NUMBER.ordinal()) ;
        } else if("浮点".equals(type)){
            resetType(ValueType.FLOAT.ordinal()) ;
        } else if("布尔".equals(type)){
            resetType(ValueType.BOOL.ordinal()) ;
        } else {
            resetType(ValueType.TEXT.ordinal()) ;
        }
    }
    
    public void resetIsContainsSpecialChar(ValueCell value){
        if(!this.isContainsSpecialChar){
            this.isContainsSpecialChar = value.isContainsSpecialChar() ;
        }
    }
    
    public void resetIsContainsSpecialChar(boolean isContainsSpecialChar){
        this.isContainsSpecialChar = isContainsSpecialChar ;
    }
    
    public String getType(){
        String typeStr = "" ;
        int i = 1 ;
        for (int type : types) {
            if(i == 1){
                typeStr += ValueType.values()[type].getDescription() ;
            } else {
                typeStr += "|" + ValueType.values()[type].getDescription() ;
            }
            i++ ;
        }
        return typeStr ;
    }

    private void setMaxLength(int length) {
//      maxLength = maxLength > length ? maxLength : length ;
        if(maxLength < length){
            maxLength = length ;
        }
    }

    public int getMinLength() {
        return minLength == 50000000 ? 0 : minLength ;
    }

    private void setMinLength(int length) {
//      minLength = minLength < length ? minLength : length ;
        if(minLength > length){
            minLength = length ;
        }
    }

    public Header(String name){
        this.name = name ;
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object obj) {
        if(this == obj){
            return true ;
        }
        
        if(obj instanceof Header){
            Header header = (Header)obj ;
            if(name != null){
                return name.equals(header.getName()) ;
            } else {
                return name == header.getName() ;
            }
        }
        return false ;
    }
    
    
    public static void main(String[] args) {
        List<Header> header = new ArrayList<Header>() ;
        Header header1 = new Header(null) ;
        Header header2 = new Header("s") ;
        Header header3 = new Header("s") ;
        Header header4 = new Header("s") ;
        header.add(header2) ;
        System.out.println(header.indexOf(header1));
        System.out.println(header1.equals(null));
        System.out.println(header1.equals(header2));
        System.out.println(header2.equals(header1));
        System.out.println(header2.equals(header3));
        System.out.println(header2.equals(header4));
        System.out.println(header3.equals(header4));
        System.out.println(header3.equals(header2));
        System.out.println(header1.equals(header3));
    }

    public String isNull() {
        return isNull ? "是" : "否" ;
    }
    /** xiaoxiong 20130328 添加获取是否为空方法 **/
    public boolean getIsNull() {
        return isNull ;
    }
    

}
