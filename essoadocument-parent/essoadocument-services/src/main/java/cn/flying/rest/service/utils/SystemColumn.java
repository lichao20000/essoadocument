package cn.flying.rest.service.utils;



public class SystemColumn {



  public static enum SysColumns {
    Create_NAME("创建人", "creator", "varchar(50)", "创建人", Value.TYPE.TEXT, "1", "", "NULL", "50",
        "1", " "), Create_date("创建日期", "credate", "varchar(20)", "创建日期", Value.TYPE.TEXT, "2", "",
        "NULL", "20", "1", ""), organ_id("所在机构", "orgId", "varchar(20)", "当前用户所在机构",
        Value.TYPE.TEXT, "3", "", "NULL", "20", "1", ""), Edit_NAME("修改人", "editname",
        "varchar(50)", "修改人", Value.TYPE.TEXT, "4", "", "NULL", "50", "1", " "), Edit_date("修改日期",
        "eidtdate", "varchar(20)", "修改日期", Value.TYPE.TEXT, "5", "", "NULL", "20", "1", ""), Control_Using(
        "限制利用", "ctrlusing", "varchar(20)", "限制利用", Value.TYPE.TEXT, "6", "", "NULL", "10", "1",
        "否"), Destroy_status("销毁状态", "destroystatus", "varchar(65)", "销毁状态", Value.TYPE.TEXT, "7",
        "", "NULL", "10", "1", ""), store_status("是否在库", "isinstore", "varchar(10)", "是否在库",
        Value.TYPE.TEXT, "8", "", "NULL", "10", "1", ""), Bussystem_ID("业务系统标识", "bussystemid",
        "varchar(20)", "业务系统标识", Value.TYPE.TEXT, "9", "", "NULL", "20", "1", ""), relation(
        "案卷卷内关联标识", "relation", "varchar(10)", "案卷卷内关联标识", Value.TYPE.TEXT, "10", "", "NULL", "10",
        "1", "");
    public String getEsidentifler() {
      return esidentifler;
    }

    public String getEsdescipt() {
      return esdescipt;
    }

    public Value.TYPE getEstype() {
      return estype;
    }

    public String getEsorder() {
      return esorder;
    }

    public String getId_metadata() {
      return id_metadata;
    }

    public String getEsisnull() {
      return esisnull;
    }

    public String getEslength() {
      return eslength;
    }

    public String getEsissystem() {
      return esissystem;
    }

    public String getFiledValue() {
      return filedValue;
    }

    private String esidentifler; // ess_tag中的那个显示的中文标题
    private String esdescipt; // ess_tag 中的描述
    private Value.TYPE estype; // ess_tag 中类型
    private String esorder; // ess_tag 中排序
    private String id_metadata; // ess_tag 中的元数据
    private String esisnull; // 是否可以为空
    private String eslength; // 字段长度
    private String esissystem; // 是否是系统字段
    private String filedValue;
    private String columnname; // 字段名称
    private String columutype; // 字段类型



    SysColumns(String esidentifler, String columnname, String columutype, String esdescipt,
        Value.TYPE estype, String esorder, String id_metadata, String esisnull, String eslength,
        String esissystem, String fieldValue)

    {
      this.esidentifler = esidentifler;
      this.columnname = columnname;
      this.esdescipt = esdescipt;
      this.esisnull = esisnull;
      this.esissystem = esissystem;
      this.eslength = eslength;
      this.esorder = esorder;
      this.estype = estype;
      this.id_metadata = id_metadata;
      this.columutype = columutype;

    }

    public String toString() {
      return this.getColumnname() + " " + this.getColumutype() + " " + this.getEsisnull() + " ,";
    }

    /**
     * @return the columnname
     */
    public String getColumnname() {
      return columnname;
    }

    /**
     * @param columnname the columnname to set
     */
    public void setColumnname(String columnname) {
      this.columnname = columnname;
    }

    /**
     * @return the columutype
     */
    public String getColumutype() {
      return columutype;
    }

    /**
     * @param columutype the columutype to set
     */
    public void setColumutype(String columutype) {
      this.columutype = columutype;
    }



  }


  public static void main(String[] args) {
    System.out.println(Value.TYPE.TEXT);
  }
}
