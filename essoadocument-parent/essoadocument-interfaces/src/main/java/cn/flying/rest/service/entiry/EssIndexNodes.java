package cn.flying.rest.service.entiry;


/**
 * 档案著录的索引服务节点
 * @author zhanglei 20131024
 *
 */
public class EssIndexNodes implements java.io.Serializable {
	private static final long serialVersionUID = -5669676563474298458L;

	private Long id;
	private String nodeHost;
	private String nodeAddress;
	private String mainSite;
	//模块类型见StoreEnum
	private String moduleArray;//创建索引后不能变更，分号分隔的每部分为模块类型:模块名称:模块part，如1:jc:jc,hs,xy,zw,kd,sk;2:hq@document:document;
	private Integer activeStatus;//0:不启用 1:启用
	private Integer searchedOrder;
	private String createTime;//索引库创建时间yyyy-MM-dd HH:mm:ss
	private String updateTime;//数据最后更新日期，以此来判断是否要更新索引库
	private int treeNodeId;//索引库对应的树节点ID
	private String struId;
	private String childStruId;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	
	public String getNodeHost() {
		return nodeHost;
	}
	public void setNodeHost(String nodeHost) {
		this.nodeHost = nodeHost;
	}
	
	public String getNodeAddress() {
		return nodeAddress;
	}
	public void setNodeAddress(String nodeAddress) {
		this.nodeAddress = nodeAddress;
	}
	
	public String getMainSite() {
		return mainSite;
	}
	public void setMainSite(String mainSite) {
		this.mainSite = mainSite;
	}
	
	public String getModuleArray() {
		return moduleArray;
	}
	public void setModuleArray(String moduleArray) {
		this.moduleArray = moduleArray;
	}
	
	public Integer getActiveStatus() {
		return activeStatus;
	}
	public void setActiveStatus(Integer activeStatus) {
		this.activeStatus = activeStatus;
	}
	
	public Integer getSearchedOrder() {
		return searchedOrder;
	}
	public void setSearchedOrder(Integer searchedOrder) {
		this.searchedOrder = searchedOrder;
	}
	
	public String getCreateTime() {
      return createTime;
    }
    public void setCreateTime(String createTime) {
      this.createTime = createTime;
    }
    
    public String getUpdateTime() {
      return updateTime;
    }
    public void setUpdateTime(String updateTime) {
      this.updateTime = updateTime;
    }
    
    public int getTreeNodeId() {
      return treeNodeId;
    }
    public void setTreeNodeId(int treeNodeId) {
      this.treeNodeId = treeNodeId;
    }
    
    
    public String getStruId() {
      return struId;
    }
    public void setStruId(String struId) {
      this.struId = struId;
    }
    public String getChildStruId() {
      return childStruId;
    }
    public void setChildStruId(String childStruId) {
      this.childStruId = childStruId;
    }
    @Override
	public String toString() {
		return new StringBuilder().append("id=").append(id)
				.append(", mainSite=").append(mainSite)
				.append(", moduleArray=").append(moduleArray).toString();
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((id == null) ? 0 : id.hashCode());
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
		EssIndexNodes other = (EssIndexNodes) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		return true;
	}
	
}
