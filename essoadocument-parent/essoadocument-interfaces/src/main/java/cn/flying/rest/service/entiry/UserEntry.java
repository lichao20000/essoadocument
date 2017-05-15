package cn.flying.rest.service.entiry;

public class UserEntry {

	private int id;

	private String userid;

	private String empName;

	private String displayName;

	private String firstName;

	private String lastName;

	private int userStatus;

	private String mobTel;

	private String emailAddress;

	private String password;

	private int gender;

	private String birthday;

	private String address;

	public UserEntry(int id, String userid, String empName, String displayName,
			String firstName, String lastName, int userStatus, String mobTel,
			String emailAddress, String password, int gender, String birthday,
			String address) {
		super();
		this.id = id;
		this.userid = userid;
		this.empName = empName;
		this.displayName = displayName;
		this.firstName = firstName;
		this.lastName = lastName;
		this.userStatus = userStatus;
		this.mobTel = mobTel;
		this.emailAddress = emailAddress;
		this.password = password;
		this.gender = gender;
		this.birthday = birthday;
		this.address = address;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		UserEntry other = (UserEntry) obj;
		if (address == null) {
			if (other.address != null)
				return false;
		} else if (!address.equals(other.address))
			return false;
		if (birthday == null) {
			if (other.birthday != null)
				return false;
		} else if (!birthday.equals(other.birthday))
			return false;
		if (displayName == null) {
			if (other.displayName != null)
				return false;
		} else if (!displayName.equals(other.displayName))
			return false;
		if (emailAddress == null) {
			if (other.emailAddress != null)
				return false;
		} else if (!emailAddress.equals(other.emailAddress))
			return false;
		if (empName == null) {
			if (other.empName != null)
				return false;
		} else if (!empName.equals(other.empName))
			return false;
		if (firstName == null) {
			if (other.firstName != null)
				return false;
		} else if (!firstName.equals(other.firstName))
			return false;
		if (gender != other.gender)
			return false;
		if (id != other.id)
			return false;
		if (lastName == null) {
			if (other.lastName != null)
				return false;
		} else if (!lastName.equals(other.lastName))
			return false;
		if (mobTel == null) {
			if (other.mobTel != null)
				return false;
		} else if (!mobTel.equals(other.mobTel))
			return false;
		if (password == null) {
			if (other.password != null)
				return false;
		} else if (!password.equals(other.password))
			return false;
		if (userStatus != other.userStatus)
			return false;
		if (userid == null) {
			if (other.userid != null)
				return false;
		} else if (!userid.equals(other.userid))
			return false;
		return true;
	}

	public String getAddress() {
		return address;
	}

	public String getBirthday() {
		return birthday;
	}

	public String getDisplayName() {
		return displayName;
	}

	public String getEmailAddress() {
		return emailAddress;
	}

	public String getEmpName() {
		return empName;
	}

	public String getFirstName() {
		return firstName;
	}

	public int getGender() {
		return gender;
	}

	public int getId() {
		return id;
	}

	public String getLastName() {
		return lastName;
	}

	public String getMobTel() {
		return mobTel;
	}

	public String getPassword() {
		return password;
	}

	public String getUserid() {
		return userid;
	}

	public int getUserStatus() {
		return userStatus;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((address == null) ? 0 : address.hashCode());
		result = prime * result
				+ ((birthday == null) ? 0 : birthday.hashCode());
		result = prime * result
				+ ((displayName == null) ? 0 : displayName.hashCode());
		result = prime * result
				+ ((emailAddress == null) ? 0 : emailAddress.hashCode());
		result = prime * result + ((empName == null) ? 0 : empName.hashCode());
		result = prime * result
				+ ((firstName == null) ? 0 : firstName.hashCode());
		result = prime * result + gender;
		result = prime * result + id;
		result = prime * result
				+ ((lastName == null) ? 0 : lastName.hashCode());
		result = prime * result + ((mobTel == null) ? 0 : mobTel.hashCode());
		result = prime * result
				+ ((password == null) ? 0 : password.hashCode());
		result = prime * result + userStatus;
		result = prime * result + ((userid == null) ? 0 : userid.hashCode());
		return result;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public void setBirthday(String birthday) {
		this.birthday = birthday;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}

	public void setEmpName(String empName) {
		this.empName = empName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public void setGender(int gender) {
		this.gender = gender;
	}

	public void setId(int id) {
		this.id = id;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public void setMobTel(String mobTel) {
		this.mobTel = mobTel;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public void setUserid(String userid) {
		this.userid = userid;
	}

	public void setUserStatus(int userStatus) {
		this.userStatus = userStatus;
	}
}