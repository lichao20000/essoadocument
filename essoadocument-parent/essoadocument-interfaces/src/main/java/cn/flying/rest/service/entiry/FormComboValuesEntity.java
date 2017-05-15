package cn.flying.rest.service.entiry;



/**
 * combox下拉框值对象类.
 */
public class FormComboValuesEntity{
	
	/**
	 * 主键id.
	 */
	private Long id;
	/**
	 * 属性值.
	 */
	private String propertyValue;
	/**
	 * 代码值.
	 */
	private String textValue;
	/**
	 * 下拉框对象的id.
	 */
	private Long comboID;

	public Long getComboID() {
		return comboID;
	}

	public void setComboID(Long comboID) {
		this.comboID = comboID;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getPropertyValue() {
		return propertyValue;
	}

	public void setPropertyValue(String propertyValue) {
		this.propertyValue = propertyValue;
	}

	public String getTextValue() {
		return textValue;
	}

	public void setTextValue(String textValue) {
		this.textValue = textValue;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		final FormComboValuesEntity other = (FormComboValuesEntity) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (id != other.id)
			return false;
		if (propertyValue == null) {
			if (other.propertyValue != null)
				return false;
		} else if (!propertyValue.equals(other.propertyValue))
			return false;
		if (textValue == null) {
			if (other.textValue != null)
				return false;
		} else if (!textValue.equals(other.textValue))
			return false;
		if (comboID == null) {
			if (other.comboID != null)
				return false;
		} else if (!comboID.equals(other.comboID))
			return false;
		return true;
	}

	@Override
	public int hashCode() {
		final int PRIME = 31;
		int result = 1;
		result = PRIME * result + ((id == null) ? 0 : id.hashCode());
		result = PRIME * result + (int) (id ^ (id >>> 32));
		result = PRIME * result + ((propertyValue == null) ? 0 : propertyValue.hashCode());
		result = PRIME * result + ((textValue == null) ? 0 : textValue.hashCode());
		result = PRIME * result + ((comboID == null) ? 0 : comboID.hashCode());
		return result;
	}

	@Override
	public String toString() {
		return this.textValue;
	}
}
