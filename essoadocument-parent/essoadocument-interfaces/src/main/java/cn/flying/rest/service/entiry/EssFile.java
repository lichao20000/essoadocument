package cn.flying.rest.service.entiry;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 * EssFile entity.
 * 
 * @author MyEclipse Persistence Tools
 */
@Entity
@Table(name = "ess_file")
public class EssFile implements java.io.Serializable {

	// Fields

	/**
	 * 
	 */
	private static final long serialVersionUID = 3896567413147303591L;
	private EssFileId id;
	private EssFolder essFolder;
	
	

	// Constructors
	

	/** default constructor */
	public EssFile() {
	}

	/** minimal constructor */
	public EssFile(EssFileId id) {
		this.id = id;
	}

	/** full constructor */
	public EssFile(EssFileId id, EssFolder essFolder) {
		this.id = id;
		this.essFolder = essFolder;
	}

	// Property accessors
	@EmbeddedId
	@AttributeOverrides( {
			@AttributeOverride(name = "originalId", column = @Column(name = "ORIGINAL_ID", precision = 10, scale = 0)),
			@AttributeOverride(name = "esmd5", column = @Column(name = "ESMD5", length = 32)),
			@AttributeOverride(name = "folderId", column = @Column(name = "FOLDER_ID")),
			@AttributeOverride(name = "estitle", column = @Column(name = "ESTITLE", length = 254)),
			@AttributeOverride(name = "essize", column = @Column(name = "ESSIZE", precision = 10, scale = 0)),
			@AttributeOverride(name = "estype", column = @Column(name = "ESTYPE", length = 20)),
			@AttributeOverride(name = "pdfId", column = @Column(name = "PDF_ID", precision = 10, scale = 0)),
			@AttributeOverride(name = "esfileState", column = @Column(name = "EFIlE_STATE", length=45)),
			@AttributeOverride(name = "createTime", column = @Column(name = "EsCreateTime")),//20121015 yangafaofei add 
			@AttributeOverride(name = "swfId", column = @Column(name = "SWF_ID", precision = 10, scale = 0)) })
	public EssFileId getId() {
		return this.id;
	}

	public void setId(EssFileId id) {
		this.id = id;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "FOLDER_ID", insertable = false, updatable = false)
	public EssFolder getEssFolder() {
		return this.essFolder;
	}

	public void setEssFolder(EssFolder essFolder) {
		this.essFolder = essFolder;
	}

}