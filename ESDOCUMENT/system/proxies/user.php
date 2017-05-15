<?php
class ProxyUser extends AgentProxyAbstract {

	/**
	 *
	 * Config服务名称
	 * @var const
	 */
	const USER_SERVICE_NAME = 'userqueryservice';

	/**
	 *
	 * 构造函数
	 * @param array $appInfo
	 * @return return_type
	 */
	public function __construct(array $appInfo) {
		parent::__construct($appInfo);
	}

	public function getUser($uid)
	{
		static $list = array();
		if (!$uid) {
			return false;
		}
		if (!isset($list[$uid])) {
			$cacheId = 'user-getuser-' . $uid;
			if (!$cache = cache::get($cacheId)) {
				$userInfo = $list[$uid] = $this->filterUser($this->getUserInfo($uid));
				cache::set($cacheId, $userInfo);
			} else {
				$list[$uid] = $cache->data;
			}
		}
		return $list[$uid];
	}


	/**
	 *
	 * 根据领导用户id获取秘书id
	 * @param string $userId
	 * @return array
	 *
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("getSecretaryListByLeaderId/{userid}")
	 * public List<TLeaderSecretary> getSecretaryListByLeaderId(@PathParam("userid") String userid);
	 */
	public function getSecretaryListByLeaderId() {
		$urlParam = array($this->getUserId());
		array_unshift($urlParam, 'getSecretaryListByLeaderId');
		$url = implode('/', $urlParam);
		$return = $this->get(self::USER_SERVICE_NAME, $url);
		return $return;
	}



	/**
	 *
	 * 判断该用户是否为待办待阅中的领导身份
	 * @return boolean
	 *
	 * @GET
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * @Path("checkLeaderIsExist/{userid}")
	 * public Boolean checkLeaderIsExist(@PathParam("userid") String userid);
	 */
	public function isLeader() {
		$urlParam = array($this->getUserId());
		array_unshift($urlParam, 'checkLeaderIsExist');
		$url = implode('/', $urlParam);
		$return = $this->get(self::USER_SERVICE_NAME, $url);
		if ($return == 'true') {
			return true;
		}
		return false;
	}

	/**
	 *
	 * 判断该用户是否为待办待阅中的秘书身份
	 * @return boolean
	 *
	 * @GET
	 * @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 * @Path("checkSecretaryIsExist/{userid}")
	 * public Boolean checkSecretaryIsExist(@PathParam("userid") String userid);
	 */
	public function isSecretary() {
		$urlParam = array($this->getUserId());
		array_unshift($urlParam, 'checkSecretaryIsExist');
		$url = implode('/', $urlParam);
		$return = $this->get(self::USER_SERVICE_NAME, $url);
		return $return;
	}

	/**
	 *
	 * 根据用户编码查找用户信息
	 * @param string $orgId  部门id
	 * @return array
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("findUserListByOrgid/{orgId}")
	 public List<UserEntry> findUserListByOrgid(@PathParam("orgId") String orgId);
	 */
	public function getUserListByOrgid($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findUserListByOrgid');
		$url = implode('/', $urlParam);
		$userList = $this->get(self::USER_SERVICE_NAME, $url);
		$return = array();
		if (count($userList)>0) {
			foreach ($userList as $key => $user) {
				$return[$user->userid] = $this->filterUserInfo($user);
			}
		}
		return $return;
	}

	/**
	 * 根据上级组织编码查找人员
	 * @param unknown_type $orgId
	 *
	 *
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findUserListByParentOrgid/{orgId}")
	 * public List<UserEntry> findUserListByParentOrgid(@PathParam("orgId") String orgId);
	 */
	public function getUserListByParentOrgId($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findUserListByParentOrgid');
		$url = implode('/', $urlParam);
		$userList = $this->get(self::USER_SERVICE_NAME, $url);
		//print_r($userList);exit;
		foreach ($userList as $key => $user) {
			$return[$user->userid] = $this->filterUserInfo($user);
		}
		return $return;
	}

	/**
	 *
	 * @param unknown_type $orgId
	 *
	 *     @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("findOrgByOrgid/{orgId}")
	 public OrgEntry findOrgByOrgid(@PathParam("orgId") String orgId);
	 */
	public function getOrgInfoByOrgId($orgId) {
		static $list = array();
		if (!isset($list[$orgId])) {
			$urlParam = array($orgId);
			array_unshift($urlParam, 'findOrgByOrgid');
			$url = implode('/', $urlParam);
			$list[$orgId] = $this->get(self::USER_SERVICE_NAME, $url);
		}
		return $list[$orgId];
	}

	/**
	 * 获取单个用户详细信息【包括了大多数字段】
	 * 说明：主要获取单个用户信息
	 * @param unknown_type $param
	 */
	private function filterUser($userObject) {
		$temp = new stdClass();
		if (isset($userObject->userid) && $userObject->userid != '') {
			foreach ($userObject as $key => $val) {
				if (is_object($val)) {
					foreach($val as $kk => $vv) {
						$userObject->{$key}->{$kk} = str_replace('NULL', '', $userObject->{$key}->{$kk});
						$userObject->{$key}->{$kk} = str_replace('null', '', $userObject->{$key}->{$kk});
					}
				} else {
					$userObject->{$key} = str_replace('NULL', '', $userObject->{$key});
					$userObject->{$key} = str_replace('null', '', $userObject->{$key});
				}
				$temp->{$key} = $userObject->{$key};
			}
		}
		return $temp;
	}

	/**
	 * 过滤用户信息【包括主要字段信息】
	 * 说明：主要用于获取大列表
	 * @param unknown_type $userObject
	 */
	private function filterUserInfo($userObject) {
		$temp = new stdClass();
		if (isset($userObject->userid) && $userObject->userid != '') {
			$temp->userid = $userObject->userid;
			$temp->realname = $userObject->empName;
			$temp->eid = $userObject->hrEmpCode;  //员工id号
			$temp->name = isset($userObject->name) ? $userObject->name : '';  //员工名称
			$temp->com_org_id = $userObject->companyEntry->orgid;  //员工所属部门（可能是多个部门）
			$temp->company = $userObject->companyEntry->orgNameDisplay;  //员工所属公司
			$temp->dept_org_id = $userObject->deptEntry->orgid;  //员工所属部门（可能是多个部门）
			$temp->department = $userObject->deptEntry->orgNameDisplay;  //员工所属部门（可能是多个部门）
			$temp->position = '';  //员工所属部门（可能是多个部门）
			//$temp->picture = isset($userObject->picture) ? $userObject->picture : 'test.gif';  //员工所属部门（可能是多个部门）
			$temp->email = $userObject->emailAddress;
			$temp->mobile = $userObject->mobTel; //
		}
		return $temp;
	}

	/**
	 * 获取部门用户列表
	 * @param string $orgId 组织编码
	 * @param string $orgClass 组织类型
	 * @param string $parentid 上级组织编码
	 *
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findDeptUserListByOrgid/{orgId}/{orgclass}/{parentid}")
	 * public List<UserEntry> findDeptUserListByOrgid(@PathParam("orgId") String orgId,
	 * @PathParam("orgclass") String orgclass,@PathParam("parentid") String parentOrgId);
	 */
	public function findDeptUserListByOrgid($orgId, $orgClass, $parentOrgId) {
		$urlParam = array($orgId, $orgClass, $parentOrgId);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findDeptUserListByOrgid');
		$url = implode('/', $urlParam);
		$userList = $this->get(self::USER_SERVICE_NAME, $url);
		$return = array();
		if (count($userList)>0) {
			foreach ($userList as $key => $user) {
				$return[$user->userid] = $this->filterUserInfo($user);
			}
		}
		return $return;
	}

	/**
	 * 获取用户借调岗和兼职岗信息
	 * @param string $userId
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("findTSiteByUserid/{userid}")
	 public List<TSite> findTSiteByUserid(@PathParam("userid") String userid);
	 */
	public function getOrgListByUserId($userId) {
		$urlParam = array($userId);
		array_unshift($urlParam, 'findTSiteByUserid');
		$url = implode('/', $urlParam);
		$orgList = $this->get(self::USER_SERVICE_NAME, $url);
		var_dump($orgList);exit;
	}

	/**
	 *
	 * 按照公司ID获取委托账号绑定的用户列表
	 * @param string $roleid
	 * @param string $orgid
	 * @return return_type
	 * @GET
	 * @Path("findRoleUserByCompany/{roleid}/{companyid}")
	 */
	public function getRoleUserByCompany($roleid, $orgid) {
		$urlParam = array($this->getAppId(), $this->getAppToken());
		//$urlParam = array();
		array_unshift($urlParam, 'findRoleUserByCompany');
		$urlParam[] = $roleid;
		$urlParam[] = $orgid;
		$url = implode('/', $urlParam);
		$userList = $this->get(self::USER_SERVICE_NAME, $url);
		$return = array();
		foreach ($userList as $key => $user) {
			$return[$user->userid] = $this->filterUserInfo($user);
		}
		return $return;
	}

	/**
	 *
	 * 按照部门ID获取委托账号绑定的用户列表
	 * @param string $roleid
	 * @param string $orgid
	 * @return return_type
	 * @GET
	 * @Path("findRoleUserByDept/{roleid}/{deptid}")
	 */
	public function getRoleUserByDept($roleid, $orgid) {
		//$urlParam = array($this->getAppId(), $this->getAppToken());
		$urlParam = array($this->getAppId(), $this->getAppToken(),$roleid,$orgid);
		array_unshift($urlParam, 'findRoleUserByDept');
		$url = implode('/', $urlParam);
		$userList = $this->get(self::USER_SERVICE_NAME, $url);
		$return = array();
		foreach ($userList as $key => $user) {
			$return[$user->userid] = $this->filterUserInfo($user);
		}
		return $return;
	}



	//紫光需要的接口
	//isleader（）已完成
	//isSecretary（）
	//findDeptUserListByOrgid

	/**
	 * 根据群组编码，查找群组
	 * @param string $gid 群组编码
	 * @return
	 * 说明：暂时没用
	 * @GE
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findGroupByGid/{gid}")
	 * public TGroup findGroupByGid(@PathParam("gid") String gid)
	 */
	public function findGroupByGid($gid) {
		$urlParam = array($gid);
		array_unshift($urlParam, 'findGroupByGid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}


	/**
	 * 根据LDAP组织编码查找对应组织信息
	 * @param unknown_type $param
	 *
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findOrgByLdapOrgid/{ldapcode}")
	 * public OrgEntry findOrgByLdapOrgid(@PathParam("ldapcode") String ldapcode);
	 */
	public function findOrgByLdapOrgid($ldapCode) {
		$urlParam = array($ldapCode);
		array_unshift($urlParam, 'findOrgByLdapOrgid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据MDM组织编码查找对应组织信息
	 * @param string $mdmCode
	 *
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findOrgByMdmOrgid/{mdmcode}")
	 * public OrgEntry findOrgByMdmOrgid(@PathParam("mdmcode") String mdmcode);
	 */
	public function findOrgByMdmOrgid($mdmCode) {
		//待fcd调整
		$urlParam = array($mdmCode);
		array_unshift($urlParam, 'findOrgByMdmOrgid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	//getOrgInfoByOrgId($orgId) 根据组织编码查找对应组织信息

	/**
	 * 根据多个MDM组织编码批量获取组织信息(组织数量不能超过50个）
	 * @param string $orglist MDM组织编码集合，用,隔开
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findOrgListByorglist/{orglist}")
	 * public List<OrgEntry> findOrgListByorglist(@PathParam("orglist") String orglist);
	 */
	public function findOrgListByOrglist($orglist) {
		$urlParam = array($orglist);
		array_unshift($urlParam, 'findOrgListByorglist');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码查找下级组织列表(不包括下级组织的子组织）
	 * @param unknown_type $orgId 组织编码
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findOrgListByParentid/{orgId}")
	 * public List<OrgEntry> findOrgListByParentid(@PathParam("orgId") String orgId);
	 */
	public function findOrgListByParentid($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, 'findOrgListByParentid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据角色编码和公司编码，查找角色下，同公司的人员
	 * @param string $roleId
	 * @param string $companyId
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findRoleUserByCompany/{roleid}/{companyid}")
	 * public List<UserEntry> findRoleUserByCompany(@PathParam("roleid") String roleid,@PathParam("companyid") String companyid);
	 */
	public function findRoleUserByCompany($roleId, $companyId) {
		$urlParam = array($roleId, $companyId);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findRoleUserByCompany');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据角色编码和组织编码，查找角色下，同组织的人员
	 * @param string $roleId
	 * @param string $deptId
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findRoleUserByDept/{roleid}/{deptid}")
	 * public List<UserEntry> findRoleUserByDept(@PathParam("roleid") String roleid,@PathParam("deptid") String deptid);
	 */
	public function findRoleUserByDept($roleId, $deptId) {
		$urlParam = array($this->getAppId(), $this->getAppToken(),$roleId, $deptId);
		array_unshift($urlParam, 'findRoleUserByDept');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据角色编码和组织编码，查找角色下，同组织的人员(包括子组织的人员)
	 * @param string $roleId
	 * @param string $orgId
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findRoleUserByOrg/{roleid}/{orgid}")
	 * public List<UserEntry> findRoleUserByOrg(@PathParam("roleid") String roleid,@PathParam("orgid") String orgid);
	 */
	public function findRoleUserByOrg($roleId, $orgId) {
		$urlParam = array($roleId, $orgId);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findRoleUserByOrg');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码查找下级公司列表
	 * @param string $orgId
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findSubCompanyListByParentid/{orgId}")
	 * public List<OrgEntry> findSubCompanyListByParentid(@PathParam("orgId") String orgId);
	 */
	public function findSubCompanyListByParentid($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, 'findSubCompanyListByParentid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码查找下级组织列表(包括下级组织的子组织）
	 * @param string $orgId
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("findSubOrgListByParentid/{orgId}")
	 * public List<OrgEntry> findSubOrgListByParentid(@PathParam("orgId") String orgId);
	 */
	public function findSubOrgListByParentid($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, 'findSubOrgListByParentid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	//getOrgListByUserId
	//getUser
	//getUserListByOrgid
	//getUserListByParentOrgId
	/**
	* 根据多个人员编号批量获取人员信息(人员数量不能超过50个）
	* @param string $userlist 用户编码集合，用,隔开
	* @GET
	* @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	* @Path("findUserListByuserlist/{userlist}")
	* public List<UserEntry> findUserListByuserlist(@PathParam("userlist") String userlist);
	*/
	public function findUserListByuserlist($userlist) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $userlist);
		array_unshift($urlParam, 'findUserListByuserlist');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 获取所有公司信息
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("getAllCompany")
	 * public List<OrgEntry> getAllCompany();
	 */
	public function getAllCompany() {
		$urlParam = array();
		array_unshift($urlParam, 'getAllCompany');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 获取所有省分公司信息
	 * @GET
	 * @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 * @Path("getCompanyList")
	 * public List<OrgEntry> getCompanyList();
	 */
	public function getCompanyList() {
		$orgList = null;
		if (!isset($orgList)) {
			$urlParam = array();
			array_unshift($urlParam, 'getCompanyList');
			$url = implode('/', $urlParam);
			$orgList = $this->get(self::USER_SERVICE_NAME, $url);
			foreach ($orgList as $key => $val) {
				if (!in_array($val->mainSite, array('hq','hi','cq','hb','qh','gz','xz','hn','jx','gs','xj','nx','sn','gx','tj','ah','sc','js','yn','fj'))) {
					unset($orgList[$key]);
				}
			}
		}
		return $orgList;
	}

	/**
	 * 获取本部门以上的所有父组织的组织列表（紫光专用）
	 * @param string $orgId 组织编码
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getFatherChainOrg/{orgid}")
	 public List<OrgEntryBean> getFatherChainOrg(@PathParam("orgid") String orgid);
	 */
	public function getFatherChainOrg($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, 'getFatherChainOrg');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}
	//getSecretaryListByLeaderId()


	/**
	 * 获取日历信息
	 * @param orgPorCode 组织LDAP编码
	 * @param calendarDate 日期，YYYY-MM
	 * @return 日历信息列表
	 */
	/* @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	@Path("getCalendarListByPorCode/{orgPorCode}/{calendarDate}")
	List<TCalendar> getCalendarListByPorCode(@PathParam("orgPorCode") String orgPorCode,@PathParam("calendarDate") String calendarDate);
	*/
	/**
	 * 获取日历信息
	 * @param string $orgPorCode 组织LDAP编码
	 * @param string $calendarDate 日期，YYYY-MM
	 */
	public function getCalendarListByPorCode($orgPorCode, $calendarDate) {
		$urlParam = array($orgPorCode, $calendarDate);
		array_unshift($urlParam, 'getCalendarListByPorCode');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 获取班次信息
	 * @param string $orgPorCode 组织LDAP编码
	 * @param string $calendarYear 班次年度,YYYY
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getDutyListByPorCode/{orgPorCode}/{calendarYear}")
	 List<TDuty> getDutyListByPorCode(@PathParam("orgPorCode") String orgPorCode,@PathParam("calendarYear") String calendarYear);
	 */
	public function getDutyListByPorCode($orgPorCode, $calendarYear) {
		$urlParam = array($orgPorCode, $calendarYear);
		array_unshift($urlParam, 'getDutyListByPorCode');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码，获取指定组织下的领导信息（紫光专用）
	 * @param string $orgId 4A组织编码
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("findLeaderByOrgid/{orgid}")
	 public UserEntryBean findLeaderByOrgid(@PathParam("orgid") String orgid);
	 */
	public function findLeaderByOrgid($orgId) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $orgId);
		array_unshift($urlParam, 'findLeaderByOrgid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码获取地区信息
	 * @param string $orgCode 独指编码
	 */
	public function getLocation($orgCode)
	{
		static $result = null;
		if (!isset($result)) {
			$cacheId = 'location_orgmap';
			if (!$cache = cache::get($cacheId)) {
				$result = array();
				$file = dirname(__FILE__) . '/location.xml';
				if (is_file($file) && ($xml = simplexml_load_file($file)) && isset($xml->org)) {
					foreach ($xml->org as $org) {
						$code = (string) $org['code'];
						list($weatherCode, $prov, $city) = explode(',', (string) $org);
						$result[$code] = array(
								'code' => $weatherCode,
								'prov' => $prov,
								'city' => $city,
						);
					}
				}
				cache::set($cacheId, $result);
			} else {
				$result = $cache->data;
			}
		}
		return isset($result[$orgCode]) ? $result[$orgCode] : null;
	}


	//以下为紫光专用接口
	/**
	* xuekun 20140704
	* 根据用户编码查找用户信息
	* 根据ID获取用户实体
	* @return
	* @GET
	* @Path("getUserInfoById/{strUserId}")
	* @Produces({MediaTypeEx.APPLICATION_JSON_UTF8})
	* public abstract UserEntry getUserInfoById(@PathParam("strUserId") String strUserId);
	*/
	public function getUserInfo($userId) {
		$urlParam = array($userId);
		array_unshift($urlParam, 'getUserByUserName');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}
	/**
	 * xuekun 20140704
	 * @param unknown_type $userId
	 * @param unknown_type $siteId
	 * @GET
	 * @Produces({ "application/json;charset=UTF-8" })
	 * @Path("findUserByUserid/{authId}/{authToken}/{userId}")
	 */
	public function getUserByUserid($userId,$siteId=1){
		$urlParam = array($this->getAppId(),$this->getAppToken(),$userId);
		array_unshift($urlParam, 'findUserByUserid');
		return $this->get(self::USER_SERVICE_NAME, $url,array('siteId'=>$siteId));
	}
	//findLeaderByOrgid

	/**
	 * 根据组织编码查找对应组织信息（紫光专用）
	 * @param string $orgId 组织编码
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getOrgInfo/{orgId}")
	 public OrgEntryBean getOrgInfo(@PathParam("orgId") String orgId);
	 */
	public function getOrgInfo($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, 'getOrgInfo');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码查找下级组织列表(不包括下级组织的子组织,紫光专用）
	 * @param string $orgId 组织编码
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getSubOrg/{orgId}")
	 public List<OrgEntryBean> getSubOrg(@PathParam("orgId") String orgId);
	 */
	public function getSubOrg($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, 'getSubOrg');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码查找下级组织列表(包括下级组织的子组织,紫光专用）
	 * @param string $orgId
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getAllSubOrg/{orgId}")
	 public List<OrgEntryBean> getAllSubOrg(@PathParam("orgId") String orgId);
	 */
	public function getAllSubOrg($orgId) {
		$urlParam = array($orgId);
		array_unshift($urlParam, 'getAllSubOrg');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据组织编码查找人员（紫光专用）
	 * @param string $orgId 组织编码
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getUserInfoByOrgId/{orgId}")
	 public List<UserEntryBean> getUserInfoByOrgId(@PathParam("orgId") String orgId);
	 */
	public function getUserInfoByOrgId($orgId) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $orgId);
		array_unshift($urlParam, 'getUserInfoByOrgId');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据多个MDM组织编码批量获取组织信息(组织数量不能超过20个，紫光专用）
	 * @param string $orgList MDM组织编码集合，用,隔开
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getOrgInfos/{orglist}")
	 public List<OrgEntryBean> getOrgInfos(@PathParam("orglist") String orglist);
	 */
	public function getOrgInfos($orgList) {
		$urlParam = array($orgList);
		array_unshift($urlParam, 'getOrgInfos');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	//getFatherChainOrg

	/**
	 * 获取所有省分公司信息（紫光专用）
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getProvinceList")
	 public List<OrgEntryBean> getProvinceList();
	 */
	public function getProvinceList() {
		$url = 'getProvinceList';
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据多个人员编号批量获取人员信息(人员数量不能超过20个，紫光专用）
	 * @param string $userList 用户编码集合，用,隔开
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("getUserInfos/{userlist}")
	 public List<UserEntryBean> getUserInfos(@PathParam("userlist") String userlist);
	 */
	public function getUserInfos($userList) {
		$urlParam = array($this->getAppId(),$this->getAppToken(), $userList);
		array_unshift($urlParam, 'getUserInfos');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据人员编码和组织编码，查找当前组织下，符合人员编码条件的人员
	 * @param $orgId 组织编码
	 * @param $userId 人员编码
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("findUserByUserIdAndOrgId/{authId}/{authToken}/{orgid}/{userid}")
	 public UserEntry findUserByUserIdAndOrgId(@PathParam("authId") String authId,
	 @PathParam("authToken") String authToken,@PathParam("orgid") String orgid,@PathParam("userid") String userid);

	 */
	public function findUserByUserIdAndOrgId($orgId, $userId) {
		//@todo 待测试
		$urlParam = array($this->getAppId(), $this->getAppToken(), $orgId, urlencode($userId));
		array_unshift($urlParam, 'findUserByUserIdAndOrgId');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 根据人员姓名和组织编码，查找当前组织下，符合姓名条件的所有人员
	 * @param $orgId 组织编码
	 * @param $userName 人员姓名
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("findUserListByUserName/{authId}/{authToken}/{orgid}/{username}")
	 public List<UserEntry> findUserListByUserName(@PathParam("authId") String authId,
	 @PathParam("authToken") String authToken,@PathParam("orgid") String orgid,@PathParam("username") String username);

	 */
	public function findUserListByUserName($orgId, $userName) {
		//@todo 待测试
		$urlParam = array($this->getAppId(), $this->getAppToken(), $orgId, urlencode($userName));
		array_unshift($urlParam, 'findUserListByUserName');
		$url = implode('/', $urlParam);
		$userList = $this->get(self::USER_SERVICE_NAME, $url);
		$return = array();
		if (count($userList)>0) {
			foreach ($userList as $key => $user) {
				$return[$user->userid] = $this->filterUserInfo($user);
			}
		}
		return $return;
	}

	/**
	 * 更新用户信息
	 * @param array $userInfo
	 *
	 * @POST
	 @Path("updateuser/{authId}/{authToken}")
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 public Boolean UpdateUserEntry(@PathParam("authId") String authId,@PathParam("authToken") String authToken,@Form UserEntry userentry);
	 */
	public function updateUser(array $userInfo) {
		$urlParam = array($this->getAppId(), $this->getAppToken());
		array_unshift($urlParam, 'updateuser');
		$url = implode('/', $urlParam);
		$data = http_build_query($userInfo);
		return $this->post(self::USER_SERVICE_NAME, $url, $data,'application/x-www-form-urlencoded');
	}

	public function findUserListByOrgCode($orgId,$startPage = 1, $pagesize = 20){
		$urlParam = array($orgId,$startPage,$pagesize);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findUserListByOrgCode');
		$url = implode('/', $urlParam);
		$userList = $this->get(self::USER_SERVICE_NAME, $url);
		$return = array();
		if (count($userList)>0) {
			foreach ($userList as $key => $user) {
				$return[$user->userid] = $this->filterUserInfo($user);
			}
		}
		return $return;
	}


	public function findUserCountByOrgCode($orgId){
		$urlParam = array($orgId);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findUserCountByOrgCode');
		$url = implode('/', $urlParam);
		$return = $this->get(self::USER_SERVICE_NAME, $url);

		return intval($return);
	}

	/**
	 * 根据UserId查询用户信息
	 * @param string $userId
	 * http://16.187.145.166:8080/eip_user/rest/userqueryservice/
	 * findUserByUseridForPhp/{appId} /{authToken}/{userId}
	 */
	public function findUserInfoByUserId($userId) {
		//@todo 待测试
		$urlParam = array($userId);
		array_unshift($urlParam, $this->getAppToken());
		array_unshift($urlParam, $this->getAppId());
		array_unshift($urlParam, 'findUserByUseridForPhp');
		$url = implode('/', $urlParam);
		$result = $this->get(self::USER_SERVICE_NAME, $url);
		if (is_object($result) && $result->userid!='') {
			return $result;
		}
		return false;
	}

	/**
	 * 更新用户岗位排序字段信息
	 * @param string $userId
	 * @param string $siteType 岗位类型（1：主岗，2：借调，3：兼职）
	 * @param string $deptCode 用户所在处室或部门编码
	 * @param string $companyCode 公司编码
	 * @param string $sort 排序号
	 *
	 * @GET
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("updateusersort/{authId}/{authToken}/{userid}/{sitetype}/{deptcode}/{orgcode}/{sort}")
	 public Boolean updateUserSiteSortInfo(@PathParam("authId") String authId,
	 @PathParam("authToken") String authToken,
	 @PathParam("userid") String userid,
	 @PathParam("sitetype") String sitetype,
	 @PathParam("deptcode") String deptcode,
	 @PathParam("orgcode") String orgcode,
	 @PathParam("sort") String sort);
	 */
	public function updateSiteSort($userId, $siteType, $deptCode, $companyCode, $sort) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $userId, $siteType, $deptCode, $companyCode, $sort);
		array_unshift($urlParam, 'updateusersort');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}

	/**
	 * 更新密码
	 *
	 * @param authId 访问者帐号
	 * @param authToken 访问者密码
	 * @param accountid 登录名
	 * @param oldPwd 原密码
	 * @param newPwd 新密码
	 * @return 格式如：｛code:0,message:'更新成功'｝

	 @PUT
	 @Produces(MediaType.APPLICATION_JSON + ";charset=UTF-8")
	 @Path("changePassword/{authId}/{authToken}")
	 public String changePassword(@PathParam("authId") String authId,
	 @PathParam("authToken") String authToken,
	 @QueryParam("accountid") String accountid,
	 @QueryParam("oldPwd") String oldPwd,
	 @QueryParam("newPwd") String newPwd);

	 */
	public function changePassword($accountid,$oldPwd,$newPwd)
	{
		$urlParam = array($this->getAppId(), $this->getAppToken());
		$userInfo = array(
				'accountid'=>$accountid,
				'oldPwd'=>$oldPwd,
				'newPwd'=>$newPwd,
		);
		array_unshift($urlParam, 'changePassword');
		$url = implode('/', $urlParam);
		$data = http_build_query($userInfo);
		return $this->post(self::USER_SERVICE_NAME, $url, $data,'application/json;charset=UTF-8');
	}
	/**
	 * 增加用户
	 * @param unknown_type $user
	 * @POST
	 * @Path("addUser")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 */
	public function saveUser($params){
		return $this->post ( self::USER_SERVICE_NAME, "addUser", $params, "text/plain;charset=UTF-8" );
	}
	/**
	 * xuekun 2014.07.04
	 * 删除用户
	 * @param unknown_type $userid
	 * @POST
	 * @Path("deleteUserByid")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 */
	public function deleteUserByid($userid){
		return $this->post ( self::USER_SERVICE_NAME, "deleteUserByid", $userid, "text/plain;charset=UTF-8" );
	}
	/**
	 *
	 *@GET
	 @Produces(MediaType.TEXT_PLAIN + ";charset=UTF-8")
	 @Path("getPasswordPolicyDes")
	 public String getPasswordPolicyDes();
	 */
	public function getPasswordPolicyDes()
	{
		$url = 'getPasswordPolicyDes';
		$return = $this->get(self::USER_SERVICE_NAME, $url);
		return $return;
	}

	/**
	 * 在以机构为前提的条件下获取用户的总记录数
	 *
	 * @param unknown_type $params
	 *
	 * @POST
	 * @Path("getCount")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public abstract int getCount(HashMap<String, String> map);
	 */
	public function getCount($params){
		return $this->post(self::USER_SERVICE_NAME, 'getCount',$params,'text/plain;charset=UTF-8');
	}
	/**
	 * 根据用户的id，获取与该用户关联的角色的id列表
	 * @param unknown_type $userid
	 * @GET
	 * @Path("getRolesByUserId/{userId}")
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 */
	public function getRolesByUserId($userId){
		$urlParam = array($userId);
		array_unshift($urlParam, 'getRolesByUserId');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_USER_SERVICE_NAME, $url);
	}
	/**
	 * xuekun 2014.07.07
	 * 根据用户的id跟大机构的ID，获取与该用户关联的角色的id列表
	 * @param unknown_type $userId
	 * @param unknown_type $bigOrgId
	 * @POST
	 * @Path("getRolesListByUserIdAndBigOrgId/{userId}/{bigOrgId}")
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 */
	public function getRolesListByUserIdAndBigOrgId($userId,$bigOrgId){
		$urlParam = array($userId,$bigOrgId);
		array_unshift($urlParam, 'getRolesListByUserIdAndBigOrgId');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_USER_SERVICE_NAME, $url);
	}
	/**
	 * 根据userId，获取与该用户关联的角色id列集合
	 * @param unknown_type $userId
	 *
	 * @GET
	 * @Path("getRolesListByUserIds/{userId}")
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 *
	 */
	public function getRolesListByUserIds($userId){
		$urlParam = array($userId);
		array_unshift($urlParam, 'getRolesListByUserIds');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}
	/**
	 * 根据userId，获取与该用户关联的角色roleCode列集合
	 * @param unknown_type $userId
	 *
	 * @GET
	 * @Path("getRoleCodesListByUserid/{userId}")
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public abstract List<String> getRoleCodesListByUserid(@PathParam("userId") String userId);
	 *
	 */
	public function getRoleCodesListByUserid($userId){
		$urlParam = array($userId);
		array_unshift($urlParam, 'getRoleCodesListByUserid');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}
	/**
	 * 根据选择的角色和条件获取用户
	 * @param unknown_type $params
	 *
	 * @POST
	 * @Path("getUserEntrys")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 */
	public function getUserEntrys($params){
		return $this->post(self::USER_SERVICE_NAME, 'getUserEntrys',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 根据机构获取机构及子机构用户实体集合
	 * @param unknown_type $params
	 *
	 * @POST
	 * @Path("getUserEntryByOrgan")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 */
	public function getUserEntryByOrgan($params){
		return $this->post(self::USER_SERVICE_NAME, 'getUserEntryByOrgan',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 根据选择的角色和条件获取用户
	 * @param unknown_type $params
	 *
	 * @POST
	 * @Path("getUserEntrysNew")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 */
	public function getUserEntrysNew($params){
		return $this->post(self::USER_SERVICE_NAME, 'getUserEntrysNew',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 根据角色ID获取拥有此角色的用户ID集合
	 * @param unknown_type $roleId
	 *
	 * @GET
	 * @Path("getUserEntrys/roleId")
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public List<Long> getUserIdsByRoleId(@PathParam("roleId") long roleId) ;
	 */
	public function getUserIdsByRoleId($roleId){
		$urlParam = array($roleId);
		array_unshift($urlParam, 'getUserEntrys');
		$url = implode('/', $urlParam);
		return $this->get(self::USER_SERVICE_NAME, $url);
	}
	/**
	 * 此方法不会校验旧密码是否和用户密码相同，请在调用此方法前进行校验
	 * @param unknown_type $userId  要修改用户的id  key:newPassword 新密码 ，oldPassword 旧密码
	 * @param unknown_type $condition
	 * @POST
	 * @Path("modifyPassword/userId")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 */
	public function modifyPassword($userId,$params){
		$urlParam = array($userId);
		array_unshift($urlParam, 'modifyPassword');
		$url = implode('/', $urlParam);
		return $this->post(self::USER_SERVICE_NAME, $url,$params,'text/plain;charset=UTF-8');

	}
}