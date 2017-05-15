package cn.flying.rest.service.entiry;

import javax.persistence.Embeddable;

/**
 * EssFileId entity.
 * 
 * @author liukaiyuan
 */
@Embeddable
public class EssFileId implements java.io.Serializable {

	// Fields

	/**
	 * 
	 */
	private static final long serialVersionUID = -1215234590169958650L;
	private String originalId;
	private String esmd5;
	private Integer folderId;
	private String estitle;
	private String essize;
	private String estype;
	private String pdfId;
	private String swfId;
	private String fileVersion;
	//表示文件是否挂接的状态“0” 表示挂接，“1”表示没有挂接
	private String esfileState;
	private Long createTime; //20121015 yanggaofei add 用于存贮文件的添加时间
	private String codeFile; //20130418 zhanglei 二维码文件
	private String esFileType;//附件类型
	
	/**
	 * 页面展示的数据，不存数据库  yanggaofei 20121017 add
	 */
	private String EssType;
	private String Dept;
	private String folderPath; //20121128 dengguoqi add
	private String onlineView;//20130329 zhanglei "true"支持在线浏览
	private String fileRead ;
	private String fileDown ;
	private String filePrint ;
	private String attachRecordId;//20130807 mazhaohui 单号 会计专用
	private String systemcode;//20130807 mazhaohui 来源系统 会计专用
	// Constructors

	/** default constructor */
	public EssFileId() {
	}

	/** full constructor */
	public EssFileId(String originalId, String esmd5, Integer folderId,
			String estitle, String essize, String estype, String pdfId, String swfId,String esfileState ,Long createTime, String folderPath) {
		this.originalId = originalId;
		this.esmd5 = esmd5;
		this.folderId = folderId;
		this.estitle = estitle;
		this.essize = essize;
		this.estype = estype;
		this.pdfId = pdfId;
		this.swfId = swfId;
		this.esfileState=esfileState;
		this.createTime=createTime;
		this.folderPath = folderPath;
	}

	// Property accessors
	
	public String getOriginalId() {
		return this.originalId;
	}
	public String getEsfileState() {
		return esfileState;
	}

	public void setEsfileState(String esfileState) {
		this.esfileState = esfileState;
	}

	public void setOriginalId(String originalId) {
		this.originalId = originalId;
	}

	public String getEsmd5() {
		return this.esmd5;
	}

	public void setEsmd5(String esmd5) {
		this.esmd5 = esmd5;
	}

	public Integer getFolderId() {
		return this.folderId;
	}

	public void setFolderId(Integer folderId) {
		this.folderId = folderId;
	}

	public String getEstitle() {
		return this.estitle;
	}

	public void setEstitle(String estitle) {
		this.estitle = estitle;
	}

	public String getEssize() {
		return this.essize;
	}

	public void setEssize(String essize) {
		this.essize = essize;
	}

	public String getEstype() {
		return this.estype;
	}

	public void setEstype(String estype) {
		this.estype = estype;
	}

	public String getPdfId() {
		return this.pdfId;
	}

	public void setPdfId(String pdfId) {
		this.pdfId = pdfId;
	}

	public String getSwfId() {
		return this.swfId;
	}

	public void setSwfId(String swfId) {
		this.swfId = swfId;
	}

	
	public String getFileVersion() {
    return fileVersion;
  }

  public void setFileVersion(String fileVersion) {
    this.fileVersion = fileVersion;
  }

	public Long getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Long createTime) {
		this.createTime = createTime;
	}
	
	public String getCodeFile() {
		return codeFile;
	}

	public void setCodeFile(String codeFile) {
		this.codeFile = codeFile;
	}
	
    public String getEsFileType() {
      return esFileType;
    }
  
    public void setEsFileType(String esFileType) {
      this.esFileType = esFileType;
    }

	public String getEssType() {
		return EssType;
	}

	public void setEssType(String essType) {
		EssType = essType;
	}
	public String getDept() {
		return Dept;
	}

	public void setDept(String dept) {
		Dept = dept;
	}

	public String getFolderPath() {
		return folderPath;
	}

	public void setFolderPath(String folderPath) {
		this.folderPath = folderPath;
	}

	public String getOnlineView() {
		return onlineView;
	}

	public void setOnlineView(String onlineView) {
		this.onlineView = onlineView;
	}
	public String getAttachRecordId() {
		return attachRecordId;
	}

	public void setAttachRecordId(String attachRecordId) {
		this.attachRecordId = attachRecordId;
	}
	public String getSystemcode() {
		return systemcode;
	}

	public void setSystemcode(String systemcode) {
		this.systemcode = systemcode;
	}
	public String getFileRead() {
		return fileRead;
	}

	public void setFileRead(String fileRead) {
		this.fileRead = fileRead;
	}
	public String getFileDown() {
		return fileDown;
	}

	public void setFileDown(String fileDown) {
		this.fileDown = fileDown;
	}
	public String getFilePrint() {
		return filePrint;
	}

	public void setFilePrint(String filePrint) {
		this.filePrint = filePrint;
	}


	public boolean equals(Object other) {
		if ((this == other))
			return true;
		if ((other == null))
			return false;
		if (!(other instanceof EssFileId))
			return false;
		EssFileId castOther = (EssFileId) other;

		return (this.getOriginalId() == castOther.getOriginalId())
				&& ((this.getEsmd5() == castOther.getEsmd5()) || (this
						.getEsmd5() != null
						&& castOther.getEsmd5() != null && this.getEsmd5()
						.equals(castOther.getEsmd5())))
				&& ((this.getFolderId() == castOther.getFolderId()) || (this
						.getFolderId() != null
						&& castOther.getFolderId() != null && this
						.getFolderId().equals(castOther.getFolderId())))
				&& ((this.getEstitle() == castOther.getEstitle()) || (this
						.getEstitle() != null
						&& castOther.getEstitle() != null && this.getEstitle()
						.equals(castOther.getEstitle())))
				&& (this.getEssize() == castOther.getEssize())
				&& ((this.getEstype() == castOther.getEstype()) || (this
						.getEstype() != null
						&& castOther.getEstype() != null && this.getEstype()
						.equals(castOther.getEstype())))
				&& (this.getPdfId() == castOther.getPdfId())
				&& (this.getSwfId() == castOther.getSwfId());
	}

	public int hashCode() {
		int result = 17;

		result = 37 * result;
		result = 37 * result
				+ (getEsmd5() == null ? 0 : this.getEsmd5().hashCode());
		result = 37 * result
				+ (getFolderId() == null ? 0 : this.getFolderId().hashCode());
		result = 37 * result
				+ (getEstitle() == null ? 0 : this.getEstitle().hashCode());
		result = 37 * result ;
		result = 37 * result
				+ (getEstype() == null ? 0 : this.getEstype().hashCode());
		result = 37 * result ;
		result = 37 * result ;
		return result;
	}

}