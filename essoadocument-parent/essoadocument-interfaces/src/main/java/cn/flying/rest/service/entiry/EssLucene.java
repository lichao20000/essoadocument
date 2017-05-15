package cn.flying.rest.service.entiry;


/**
 * @see 全文索引库实体
 *
 */
public class EssLucene implements java.io.Serializable {
	private static final long serialVersionUID = 8564519024206870603L;
	//主键
	private Long id;
	//节点路径
	private String leafagenodePath;
	//节点名称
	private String leafagenodeName;
	//索引库路径
	private String indexPath;
//	private Set<EssIndex> essIndexes = new HashSet<EssIndex>(0);
//	private Set<EssIndexRight> essIndexRights = new HashSet<EssIndexRight>(0);

	// Constructors

	/** 默认构造 */
	public EssLucene() {
	}

	/** 有参构造 */
	public EssLucene(String leafagenodePath, String leafagenodeName) {
		this.leafagenodePath = leafagenodePath;
		this.leafagenodeName = leafagenodeName;
	}

	/** 全参构造 */
/**	public EssLucene(String leafagenodePath, String leafagenodeName,
			String indexPath, Set<EssIndex> essIndexes,
			Set<EssIndexRight> essIndexRights) {
		this.leafagenodePath = leafagenodePath;
		this.leafagenodeName = leafagenodeName;
		this.indexPath = indexPath;
		this.essIndexes = essIndexes;
		this.essIndexRights = essIndexRights;
	}*/
	
	public EssLucene(String leafagenodePath, String leafagenodeName,
			String indexPath) {
		this.leafagenodePath = leafagenodePath;
		this.leafagenodeName = leafagenodeName;
		this.indexPath = indexPath;
	}
	// Property accessors
	public Long getId() {
		return this.id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getLeafagenodePath() {
		return this.leafagenodePath;
	}

	public void setLeafagenodePath(String leafagenodePath) {
		this.leafagenodePath = leafagenodePath;
	}

	public String getLeafagenodeName() {
		return this.leafagenodeName;
	}

	public void setLeafagenodeName(String leafagenodeName) {
		this.leafagenodeName = leafagenodeName;
	}

	public String getIndexPath() {
		return this.indexPath;
	}

	public void setIndexPath(String indexPath) {
		this.indexPath = indexPath;
	}

/*	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "essLucene")
	public Set<EssIndex> getEssIndexes() {
		return this.essIndexes;
	}

	public void setEssIndexes(Set<EssIndex> essIndexes) {
		this.essIndexes = essIndexes;
	}

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "essLucene")
	public Set<EssIndexRight> getEssIndexRights() {
		return this.essIndexRights;
	}

	public void setEssIndexRights(Set<EssIndexRight> essIndexRights) {
		this.essIndexRights = essIndexRights;
	}
*/
}
