package cn.flying.rest.service.entiry;

import java.io.Serializable;

public class Role implements Serializable{
  private static final long serialVersionUID = -6363204815866359644L;

  /** 角色ID **/
	private String id;
	
	/** 角色标识**/
	private String roleId;
	
	/** 角色中文名 **/
	private String roleName;
	
	/** 注释 **/
	private String roleRemark;
	
	/** 创建时间 **/
	private String createTime;
	
	/** 修改时间 **/
	private String updateTime;
	
	/** 是否为系统角色 **/
	private String isSystem;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getRoleId() {
		return roleId;
	}

	public void setRoleId(String roleId) {
		this.roleId = roleId;
	}

	public String getRoleName() {
		return roleName;
	}

	public void setRoleName(String roleName) {
		this.roleName = roleName;
	}

	public String getRoleRemark() {
		return roleRemark;
	}

	public void setRoleRemark(String roleRemark) {
		this.roleRemark = roleRemark;
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

	public String getIsSystem() {
		return isSystem;
	}

	public void setIsSystem(String isSystem) {
		this.isSystem = isSystem;
	}
	
}
