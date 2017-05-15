package cn.flying.rest.service.entiry;



public class EssReport {

  private long idReport;
  private String resourcelevel;
  private String reportstyle;
  private String title;
  private String perpage;
  private String reportmodel;
  private String ishave;
  private String uplodaer;
  private String reportType;


  public EssReport() {}

  public EssReport(String resourcelevel, String reportstyle, String title, String perpage,
      String reportmodel, String ishave, String uplodaer, String reportType) {
    this.resourcelevel = resourcelevel;
    this.reportstyle = reportstyle;
    this.title = title;
    this.perpage = perpage;
    this.reportmodel = reportmodel;
    this.ishave = ishave;
    this.uplodaer = uplodaer;
    this.reportType = reportType;
  }

  public boolean equals(Object o) {
    if (null == o)
      return false;
    final EssReport report = (EssReport) o;
    if (this.title.equals(report.getTitle()) && this.idReport == report.getIdReport())
      return true;
    return false;
  }

  public long getIdReport() {
    return this.idReport;
  }

  public String getIshave() {
    return this.ishave;
  }

  public String getPerpage() {
    return this.perpage;
  }

  public String getReportmodel() {
    return this.reportmodel;
  }

  public String getReportstyle() {
    return this.reportstyle;
  }

  public String getReportType() {
    return reportType;
  }

  public String getResourcelevel() {
    return this.resourcelevel;
  }

  public String getTitle() {
    return this.title;
  }

  public String getUplodaer() {
    return this.uplodaer;
  }

  public int hashCode() {
    return (this.title != null ? title.hashCode() : 0);
  }

  public void setIdReport(long idReport) {
    this.idReport = idReport;
  }

  public void setIshave(String ishave) {
    this.ishave = ishave;
  }

  public void setPerpage(String perpage) {
    this.perpage = perpage;
  }

  public void setReportmodel(String reportmodel) {
    this.reportmodel = reportmodel;
  }

  public void setReportstyle(String reportstyle) {
    this.reportstyle = reportstyle;
  }

  public void setReportType(String reportType) {
    this.reportType = reportType;
  }

  public void setResourcelevel(String resourcelevel) {
    this.resourcelevel = resourcelevel;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setUplodaer(String uplodaer) {
    this.uplodaer = uplodaer;
  }

}
