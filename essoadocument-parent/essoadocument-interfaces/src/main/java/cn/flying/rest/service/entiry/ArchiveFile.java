package cn.flying.rest.service.entiry;

import java.io.Serializable;

/**
 * 外系统归档文件
 * @author zhanglei 20130506
 *
 */
public class ArchiveFile implements Serializable {
	private static final long serialVersionUID = 5618138748693425022L;

	private String fileId;
	private String fileName;
	private String fileType;
	private String fileSize;
	private String createTime;
	private String contentMD5;
	private String documentType;
	private String folderId;
	private String itemOrder;
	private String attachRecordId;
	private String systemCode;
	
	public ArchiveFile(String fileId) {
		this.fileId = fileId;
	}
	
	public String getFileId() {
		return fileId;
	}
	public void setFileId(String fileId) {
		this.fileId = fileId;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getFileType() {
		return fileType;
	}
	public void setFileType(String fileType) {
		this.fileType = fileType;
	}
	public String getFileSize() {
		return fileSize;
	}
	public void setFileSize(String fileSize) {
		this.fileSize = fileSize;
	}
	public String getCreateTime() {
		return createTime;
	}
	public void setCreateTime(String createTime) {
		this.createTime = createTime;
	}
	public String getContentMD5() {
		return contentMD5;
	}
	public void setContentMD5(String contentMD5) {
		this.contentMD5 = contentMD5;
	}
	public String getDocumentType() {
		return documentType;
	}
	public void setDocumentType(String documentType) {
		this.documentType = documentType;
	}
	public String getFolderId() {
		return folderId;
	}
	public void setFolderId(String folderId) {
		this.folderId = folderId;
	}
	public String getItemOrder() {
		return itemOrder;
	}
	public void setItemOrder(String itemOrder) {
		this.itemOrder = itemOrder;
	}

	public String getAttachRecordId() {
		return attachRecordId;
	}
	public void setAttachRecordId(String attachRecordId) {
		this.attachRecordId = attachRecordId;
	}
	public String getSystemCode() {
		return systemCode;
	}
	public void setSystemCode(String systemCode) {
		this.systemCode = systemCode;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((fileId == null) ? 0 : fileId.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		final ArchiveFile other = (ArchiveFile) obj;
		if (fileId == null) {
			if (other.fileId != null)
				return false;
		} else if (!fileId.equals(other.fileId))
			return false;
		return true;
	}
	
}
