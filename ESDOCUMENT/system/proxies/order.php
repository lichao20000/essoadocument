<?php
class ProxyOrder extends AgentProxyAbstract {

	/**
	 *
	 * Order服务名称
	 * @var const
	 */
	const ORDER_SERVICE_NAME = 'orderservice';

	public function __construct($appInfo) {
		parent::__construct($appInfo);

	}
	/**
	 * 获得一条saas申请记录
	 */
	public function getSaasApplyById($applyid){
		return  $this->get(self::ORDER_SERVICE_NAME,'getSaasApplyById/'.$applyid);
	}
	/**
	 * 添加组织机构
	 */
	public function addApplySaas($params) {
		return $this->post ( self::ORDER_SERVICE_NAME, "addApplySaas", $params, "application/json;charset=UTF-8" );
	}
	/**
	 * 
	 * xuekun  added in  2014-8-14
	 */
	public function getAllAppName()
	{
		$url = "getAppNameList";
		return $this->post(self::ORDER_SERVICE_NAME, $url,"application/json;charset=UTF-8");
	}
	/**
	 * 批量添加订单详情
	 * xuekun  added in  2014-7-21
	 * @param unknown_type $params
	 * @POST
	 * @Path("bachAddOrderitems")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean bachAddOrderitems(List<Map<String, Object>> params);
	 */
	public function bachAddOrderitems($params){
		return $this->post(self::ORDER_SERVICE_NAME, 'bachAddOrderitems',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 更新订单状态
	 * xuekun  added in  2014-7-21
	 * @param unknown_type $ids
	 * @POST
	 * @Path("bachUpdateOrderitemStatus")
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean bachUpdateOrderitemStatus(String orderitemids);
	 */
	public function bachUpdateOrderitemStatus($params){
		return $this->post(self::ORDER_SERVICE_NAME, 'bachUpdateOrderitemStatus',$params,'application/json;charset=UTF-8');
	}

	/**
	 *
	 * xuekun  added in  2014-7-21
	 * @param unknown_type $ids
	 * @POST
	 * @Path("grantApplyAppsByOrderitems")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean grantApplyAppsByOrderitems(String orderitemids);
	 */
	public function grantApplyAppsByOrderitems($ids){
		return $this->post(self::ORDER_SERVICE_NAME, 'grantApplyAppsByOrderitems',$ids,'application/json;charset=UTF-8');
	}
	/**
	 * 批量添加系统权限给指定
	 * xuekun  added in  2014-7-21
	 * @param unknown_type $params
	 * @POST
	 * @Path("bachGrantApply")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean bachGrantApply(List<Map<String, Object>> params);
	 */
	public function bachGrantApply($params){
		return $this->post(self::ORDER_SERVICE_NAME, 'bachGrantApply',$params,'application/json;charset=UTF-8');
	}
	/**
	 *
	 * xuekun  added in  2014-7-17
	 * @param unknown_type $userid
	 * @POST
	 * @Path("getAppListWhitUserRight")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public List<Map<String, Object>> getAppListWhitUserRight(
	 * Map<String, String> params);
	 */
	public function getAppListWhitUserRight($params){
		return $this->post(self::ORDER_SERVICE_NAME, 'getAppListWhitUserRight',$params,'application/json;charset=UTF-8');

	}
	/**
	 * @POST
	 * @Path("getAppListWhitUserRightCont")
	 * @Consumes(MediaTypeEx.APPLICATION_FORM_URLENCODED)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public long getAppListWhitUserRightCount(
	 * String keyword);
	 */
	public function  getAppListWhitUserRightCount($params){
		return $this->post(self::ORDER_SERVICE_NAME, 'getAppListWhitUserRightCont',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 判断用户是否有权限访问某系统
	 * @GET
	 * @Path("judgeAccessRight/{applyappid}/{saasid}/{userid}")
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean judgeAccessRight(@PathParam("applyappid") long applyappid,
	 * @PathParam("saasid") long saasid,@PathParam("userid") long userid);
	 * xuekun  added in  2014-7-16
	 * @param unknown_type $applyappid
	 * @param unknown_type $saasid
	 */
	public function judgeAccessRight($applyappid,$saasid,$userid){
		$urlparam=array($applyappid,$saasid,$userid);
		array_unshift($urlparam, 'judgeAccessRight');
		$url=implode('/', $urlparam);
		return $this->get(self::ORDER_SERVICE_NAME, $url);
	}
	/**
	 * 获得某用户所有的可访问的权限列表
	 * xuekun  added in  2014-7-14
	 * @param unknown_type $userid
	 * @GET
	 * @Path("getGrantAppByUserId/{userid}")
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public List<Map<String, Object>> getGrantAppByUserId(
	 * @PathParam("userid") long userid);
	 */
	public function getGrantAppByUserId($userid){
		$urlparam=array($userid);
		array_unshift($urlparam, 'getGrantAppByUserId');
		$url=implode('/', $urlparam);
		$list=$this->get(self::ORDER_SERVICE_NAME, $url);
		return $list;
	}
	/**
	 * 给某用户添加saas系统的权限
	 * xuekun  added in  2014-7-14
	 * @param saasids
	 *            如果是多个 使用逗号分割 如 1,2,3
	 * @param userid
	 *            用户id
	 * @return
	 * @POST
	 *@Path("grantSaasAppsByUserid/{userid}")
	 *@Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 *public boolean grantSaasAppsByUserid(@QueryParam("saasids") String saasids,
	 * @PathParam("userid") long userid);
	 */
	public  function grantSaasAppsByUserid($saasids,$userid){
		$urlparam=array($userid);
		array_unshift($urlparam, 'grantSaasAppsByUserid');
		$url=implode('/', $urlparam);
		return $this->post(self::ORDER_SERVICE_NAME, $url,$saasids,'application/json;charset=UTF-8');
	}
	/**
	 * xuekun  added in  2014-7-14
	 * 给某用户添加基础服务的权限
	 *
	 * @param applyappids
	 *            如果是多个 使用逗号分割 如 1,2,3
	 * @param userid
	 *            用户id
	 * @return
	 * @POST
	 * @Path("grantApplyAppsByUserid/{userid}")
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public boolean grantApplyAppsByUserid(
	 * @QueryParam("applyappids") String applyappids,
	 * @PathParam("userid") long userid);
	 */
	public function grantApplyAppsByUserid($applyappids,$userid){
		$urlparam=array($userid);
		array_unshift($urlparam,'grantSaasAppsByUserid');
		$url==implode('/',$urlparam);
		return $this->post(self::ORDER_SERVICE_NAME,$url,$applyappids,'application/json;charset=UTF-8');

	}

	/**
	 * 根据id获取order
	 * xuekun  added in  2014-7-14
	 * @param orderid
	 * @return
	 * @GET
	 * @Path("getOrder/{orderid}")
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public Map<String, Object> getOrder(@PathParam("orderid") long orderid);
	 */
	public function getOrder($orderid){
		return $this->get(self::ORDER_SERVICE_NAME,'getOrder/'.$orderid);
	}
	/**
	 * xuekun  added in  2014-7-14
	 * 根据orderid获取orderitem列表
	 * 有分页和关键词查询
	 * @param orderid
	 * @return
	 *
	 * @POST
	 * @Path("getOrderItems")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * public List<Map<String, Object>> getOrderItems(Map<String,String> params);
	 */
	public function getOrderItems($params){
		return $this->post(self::ORDER_SERVICE_NAME,'getOrderItems',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 获得订购服务订单详情的数据条数 有关键词查询
	 * xuekun  added in  2014-7-22
	 * @param unknown_type $orderid
	 * @param unknown_type $keyword
	 * @post
	 * @Path("getOrderItemsCount")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public long getOrderItemsCount(long orderid,String keyword);
	 */

	public function getOrderItemsCount($orderid,$keyword){
		$data['orderid']=$orderid;
		$data['keyword']=$keyword;
		return $this->post(self::ORDER_SERVICE_NAME,'getOrderItemsCount',json_encode($data),'application/json;charset=UTF-8');
	}
	/**
	 * 添加一个订购
	 * xuekun added in 2014-7-14
	 *
	 * @param map
	 * @return
	 * @POST
	 * @Path("addOrder")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean addOrder(HashMap<String, String> map);
	 */
	public  function addOrder($params){
		return $this->post(self::ORDER_SERVICE_NAME, 'addOrder',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 删除一个订购
	 * xuekun added in 2014-7-14
	 * @param id
	 * @return
	 * @GET
	 * @Path("deleteOrderByid/{id}")
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean deleteOrderByid(@PathParam("id")long id);
	 */
	public function  deleteOrderByid($id){
		return  $this->get(self::ORDER_SERVICE_NAME, 'deleteOrderByid/'.$id);
	}
	/**
	 * 添加一条订购详情记录
	 * xuekun added in 2014-7-14
	 * @param map
	 * @return
	 * @POST
	 * @Path("addOrderItem")
	 * @Consumes(MediaTypeEx.APPLICATION_JSON_UTF8)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean addOrderItem(final HashMap<String, String> map);
	 */
	public function  addOrderItem($params){
		return $this->post(self::ORDER_SERVICE_NAME, 'addOrderItem',$params,'application/json;charset=UTF-8');
	}
	/**
	 * 删除一条订购详情记录
	 * xuekun added in 2014-7-14
	 * @param id
	 * @return
	 * @GET
	 * @Path("deleteOrderItemByid/{id}")
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean deleteOrderItemByid(@PathParam("id")long id);
	 */
	public function  deleteOrderItemByid($id){
		return  $this->get(self::ORDER_SERVICE_NAME, 'deleteOrderItemByid/'.$id);

	}
	/**
	 * 改变订购状态 0未完成，1，完成
	 * xuekun added in 2014-7-14
	 * @param id
	 * @param status
	 * @return
	 * @POST
	 * @Path("changeOrderStatus/{status}")
	 * @Consumes(MediaTypeEx.APPLICATION_FORM_URLENCODED)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean changeOrderStatus(@QueryParam("ids") long id,
	 * @PathParam("status") int status);
	 */
	public  function changeOrderStatus($id,$status){
		return $this->post(self::ORDER_SERVICE_NAME, 'changeOrderStatus',http_build_query(array('id'=>$id,'status'=>$status)),'application/x-www-form-urlencoded');
	}
	/**
	 * 批量改变订购详情状态 0 未赋予权限 默认，1，赋予权限
	 * xuekun added in 2014-7-14
	 * @param ids
	 * @param status
	 * @return
	 * @POST
	 * @Path("changeOrderItemStatus/{status}")
	 * @Consumes(MediaTypeEx.APPLICATION_FORM_URLENCODED)
	 * @Produces(MediaTypeEx.TEXT_PLAIN_UTF8)
	 * public boolean changeOrderItemStatus(@QueryParam("ids") String ids,
	 * @PathParam("status") int status);
	 */
	public function changeOrderItemStatus($ids,$status){
		return $this->post(self::ORDER_SERVICE_NAME, 'changeOrderItemStatus',http_build_query(array('ids'=>$ids,'status'=>$status)),'application/x-www-form-urlencoded');
	}





	/**
	 *
	 * Enter description here ...
	 * @param unknown_type $param
	 * @return return_type
	 * @GET
	 * @Path("findProduct/{authId}/{authToken}")
	 */
	public function getProductList($reset = null) {
		static $list = null;
		if ($reset === null && AopConfig::get('debug', false)) {
			$reset = true;
		}
		if (!isset($list) || $reset) {
			$cacheId = 'proxy_productslist';
			if ($reset || !($cache = cache::get($cacheId))) {
				$urlParam = array($this->getAppId(), $this->getAppToken(), "PRODUCT_TYPE='webApp'");
				array_unshift($urlParam, 'findProduct');
				$url = implode('/', $urlParam);
				//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
				//         $tmp = $this->get(self::ORDER_SERVICE_NAME, $url);
				$tmp = '';
				$list = array();

				$systemInfo = AopApp::getInfo('system');
				$systemInstance = AopApp::getInstance($systemInfo);
				if(is_array($tmp) && count($tmp)>0){
					foreach($tmp as $key=>$value){
						if (false !== strpos($value->appId, '-')) {
							$appId = strstr($value->appId, '-', true);
							$appInfo = AopApp::getInfo($value->appId);
							if (!$appInfo || !$appInfo['is_multi_product']) {
								continue;
							}
							$info = $systemInstance->invokePublic($value->appId, 'productInfo');
							$list[$value->appId] = (array)$value + (array)$info;
						} else {
							$list[$value->appId] = (array)$value;
						}
					}
				}
				cache::set($cacheId, $list);
			} else {
				$list = $cache->data;
			}
		}
		return $list;
	}

	public function findProductList($name,$condition = array()) {
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		return array();
		//     $urlParam = array($this->getAppId(), $this->getAppToken());
		//     $where = "PRODUCT_TYPE='webApp' AND (APP_ID LIKE '%$name%' OR PRODCUT_NAME LIKE '%$name%')";
		//     if (count($condition) > 0) {
		//       $where .= ' AND ' . implode(' AND ', $condition);
		//     }

		//     $urlParam[] = rawurlencode($where);
		//     array_unshift($urlParam, 'findProduct');
		//     $url = implode('/', $urlParam);

		//     $result = $this->get(self::ORDER_SERVICE_NAME, $url);
		//     if (empty($result)){
		//       return array();
		//     }
		//     $appList = AopApp::getList(AopConfig::get('debug', false));
		//     if (empty($appList)){
		//       return array();
		//     }
		//     $systemInfo = AopApp::getInfo('system');
		//     $systemInstance = AopApp::getInstance($systemInfo);
		//     $list = array();
		//     foreach($result as $value) {
		//       if (false !== strpos($value->appId, '-')) {
		//         $appId = strstr($value->appId, '-', true);
		//         $appId = AopApp::getIdFromAppId($appId);
		//         $appInfo = AopApp::getInfo($value->appId);
		//         if (!$appInfo || !$appInfo['is_multi_product']) {
		//           continue;
		//         }
		//         $info = $systemInstance->invokePublic($value->appId, 'productInfo');
		//         $list[$value->appId] = (array)$value + (array)$info;
		//       } else {
		//         $appId = AopApp::getIdFromAppId($value->appId);
		//         if (!isset($appList[$appId])) continue;
		//         $list[$appId] = (array)$value + (array)$appList[$appId];
		//       }
		//     }
		//     return $list;
	}

	public function createOrderExt($ownerId, array $appList) {
		$urlParam = array($this->getAppId(), $this->getAppToken());
		array_unshift($urlParam, 'addOrderExt');
		$params = array('orderItems' => $appList,'ownerId'=>$ownerId, 'status'=> 0);

		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->post(self::ORDER_SERVICE_NAME, $url, json_encode($params), 'application/json;charset=UTF-8');
		return "true";
	}

	/**
	 *
	 * 创建订单Instance
	 * @param array $orderInstance
	 * @return boolean
	 * 说明：java服务已取消
	 * @see java public void addOrderInstance(String authId, String authToken, OrderInstance orderInstance)
	 * @POST
	 * @Path("addOrderInstance/{authId}/{authToken}")
	 * public String addOrderInstance(@PathParam("authId") String authId,
	 @PathParam("authToken") String authToken,
	 OrderInstance orderInstance);
	 */
	public function createOrderInstance(array $orderInstance) {
		if (!isset($orderInstance['itemId'])) {
			$orderInstance['itemId'] = '';
		}
		if (!isset($orderInstance['properties'])) {
			$orderInstance['properties'] = '';
		}
		$orderInstance['fulfillmentDate'] = REQUEST_TIME;

		$urlParam = array($this->getAppId(), $this->getAppToken());
		array_unshift($urlParam, 'addOfferInstance');

		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     $return =  $this->post(self::ORDER_SERVICE_NAME, $url, json_encode($orderInstance), 'application/json;chartset=UTF-8');
		$return =  "true";
		return trim($return);
	}

	/**
	 *
	 * @param unknown_type $userId
	 * @param unknown_type $status
	 *
	 * @GET
	 * @Path("findOfferInstance/{authId}/{authToken}/{condition}")
	 * @Produces(MediaType.APPLICATION_JSON + ";chartset=UTF-8")
	 */
	public function getOfferInstanceList($userId, $status = 1)
	{
		$urlParam = array($this->getAppId(), $this->getAppToken(), rawurlencode('OWNER_ID=\''.$userId.'\' AND STATUS=\''.$status.'\''));
		array_unshift($urlParam, 'findOfferInstance');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->get(self::ORDER_SERVICE_NAME, $url);
		return '';
	}


	public function updateOfferInstanceStatus($instanceId, $status)
	{
		$urlParam = array($this->getAppId(), $this->getAppToken(), $instanceId, $status);
		array_unshift($urlParam, 'updateOfferInstanceStatusByNo');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->put(self::ORDER_SERVICE_NAME, $url, '');
		return "true";
	}

	public function getOrderList( $status, $userid = null)
	{
		$urlParam = array($this->getAppId(), $this->getAppToken());
		$where = "STATUS='$status'";
		if(isset($userid)) {
			$where .= " AND OWNER_ID='$userid'";
		}
		$urlParam[] = rawurlencode($where);
		array_unshift($urlParam, 'findOrderExt');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->get(self::ORDER_SERVICE_NAME, $url);
		return '';
	}



	public function getOrderListAll($status)
	{
		$urlParam = array($this->getAppId(), $this->getAppToken(), 'STATUS=\''.$status.'\'');
		array_unshift($urlParam, 'findOrder');
		$url = implode('/', $urlParam);
		return $this->get(self::ORDER_SERVICE_NAME, $url);
	}

	public function getOrderInfo($id){
		$urlParam = array($this->getAppId(), $this->getAppToken(),$id);
		array_unshift($urlParam, 'getOrderExt');
		$url = implode('/', $urlParam);
		return $this->get(self::ORDER_SERVICE_NAME, $url);
	}

	public function updateOrderStatus($order_id, $status)
	{
		$urlParam = array($this->getAppId(), $this->getAppToken(), $order_id, intval($status));
		array_unshift($urlParam, 'updateOrderStatus');
		$url = implode('/', $urlParam);
		return $this->put(self::ORDER_SERVICE_NAME, $url, '', null);
	}

	public function getProductInfo($productId)
	{
		$urlParam = array($this->getAppId(), $this->getAppToken(),$productId);
		array_unshift($urlParam, 'getProduct');
		$url = implode('/', $urlParam);
		return $this->get(self::ORDER_SERVICE_NAME, $url);
	}

	/**
	 *
	 * 根据OwnerId和parentInstanceId删除订单实例
	 * @param unknown_type $memberId
	 * @param unknown_type $instanceId
	 * @return return_type
	 *
	 * @DELETE
	 * @Path("removeOfferInstanceByOwnerIdAndPID/{authId}/{authToken}/{ownerId}/{parentInstanceId}")
	 * @Produces(MediaType.TEXT_PLAIN)
	 */
	public function deleteOrderInstanceByParentId($memberId, $parentInstanceId) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $memberId, $parentInstanceId);
		array_unshift($urlParam, 'removeOfferInstanceByOwnerIdAndPID');
		$url = implode('/', $urlParam);
		return $this->remove(self::ORDER_SERVICE_NAME, $url);
	}

	/**
	 *
	 * 根据APPID获取product信息
	 * @param string $appId
	 * @return return_type
	 * @GET
	 * @Path("getProductByAppId/{authId}/{authToken}/{appId}")
	 */
	public function getProductInfoByAppId($appId) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $appId);
		array_unshift($urlParam, 'getProductByAppId');
		$url = implode('/', $urlParam);
		return $this->get(self::ORDER_SERVICE_NAME, $url);
	}

	/**
	 *
	 * 根据offerInstanceNo获取offerInstance信息
	 * @return return_type
	 * @GET
	 * @Path("getOfferInstanceByNo/{authId}/{authToken}/{offerInstanceNo}")
	 *
	 *
	 *   @GET
	 @Path("findOfferInstance/{authId}/{authToken}/{condition}")
	 public List<OfferInstance> findOfferInstance(
	 @PathParam("authId") String authId,
	 @PathParam("authToken") String authToken,
	 @PathParam("condition") String condition);
	 */
	public function getOfferInstanceByNo($offerInstanceNo) {
		/*     $urlParam = array($this->getAppId(), $this->getAppToken(), $offerInstanceNo);
		 array_unshift($urlParam, 'getOfferInstanceByNo'); */
		$urlParam = array('orderservice', 'wwwwww', rawurlencode('OFFER_INSTANCE_NO=\''.$offerInstanceNo.'\''));
		array_unshift($urlParam, 'findOfferInstance');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     $result = $this->get(self::ORDER_SERVICE_NAME, $url);
		$result = '';
		if (is_array($result) && count($result)==1) {
			return reset($result);
		} else {
			return $result;
		}
	}

	/**
	 *
	 * 根据ownerId和parentInstanceNo获取instance信息
	 * @param unknown_type $memberId
	 * @param unknown_type $parentInstanceNo
	 * @return return_type
	 * @GET
	 * @Path("getOfferInstanceByOwnerIdAndPID/{authId}/{authToken}/{ownerId}/{parentInstanceId}")
	 */
	public function getOfferInstanceByParentNoAndMemberId($memberId, $parentInstanceNo) {
		//待测试
		/*     $urlParam = array($this->getAppId(), $this->getAppToken(), $memberId, $parentInstanceNo);
		 array_unshift($urlParam, 'getOfferInstanceByOwnerIdAndPID'); */
		//rawurlencode('OWNER_ID=\''.$userId.'\' AND STATUS='.$status)
		$urlParam = array('orderservice', 'wwwwww', rawurlencode('PARENT_INSTANCE_ID=\''.$parentInstanceNo.'\' AND OWNER_ID=\''.$memberId.'\''));
		array_unshift($urlParam, 'findOfferInstance');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->get(self::ORDER_SERVICE_NAME, $url);
		return '';
	}

	/**
	 *
	 * 根据ownerId和parentInstanceNo更新instance状态信息
	 * @param unknown_type $offerInstanceNo
	 * @param unknown_type $status
	 * @return Ambigous <mixed, string>
	 * @PUT
	 * @Path("updateOfferInstanceStatusByNo/{authId}/{authToken}/{offerInstanceNo}/{status}")
	 * @Produces(MediaType.TEXT_PLAIN)
	 */
	public function updateOfferInstanceByNo($offerInstanceNo, $status) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $offerInstanceNo, $status);
		array_unshift($urlParam, 'updateOfferInstanceStatusByNo');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->put(self::ORDER_SERVICE_NAME, $url, '');
		return "true";
	}

	/**
	 * 下单即开通
	 * @param array $productIds
	 *
	 * @POST
	 @Path("dredgeApp/{authId}/{authToken}/{userId}")
	 public Boolean dredgeApp(@PathParam("authId") String authId,
	 @PathParam("authToken") String authToken,
	 @PathParam("userId") String userId, List<Long> productids) throws Exception;
	 */
	public function dredgeApp(array $productIds) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), $this->getUserId());
		array_unshift($urlParam, 'dredgeApp');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->post(self::ORDER_SERVICE_NAME, $url, json_encode($productIds), 'application/json;charset=UTF-8');
		return "true";
	}

	public function getOfferInstanceByProductId($productId) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), rawurlencode('PRODUCT_ID =\''.$productId.'\' and STATUS = \'1\''));
		array_unshift($urlParam, 'findOfferInstance');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->get(self::ORDER_SERVICE_NAME, $url);
		return '';
	}

	public function findProductInfoByAppId($appId) {
		$urlParam = array($this->getAppId(), $this->getAppToken(), rawurlencode('APP_ID =\''.$appId.'\''));
		array_unshift($urlParam, 'findProduct');
		$url = implode('/', $urlParam);
		//liqiubo 20140610 原来调用的是eipmock中的服务，屏蔽掉，不让其调用了，直接返回原eipmock中返回的值
		//     return $this->get(self::ORDER_SERVICE_NAME, $url);
		return '';
	}
	
	/**
	 * 拒绝申请
	 * wanghongchen 20141013
	 * @param unknown $param
	 * @return Ambigous <return_type, mixed, string>
	 */
	public function refuseApply($param){
		return $this->post ( self::ORDER_SERVICE_NAME, "refuseApply", $param, "application/json;charset=UTF-8" );
	}
	public function getDefaultAppName($userid){
		return $this->post (self::ORDER_SERVICE_NAME, "getDefaultAppName", json_encode(array('userid'=>$userid)), "application/json;charset=UTF-8" );
		
	}
public  function  getSuperUserName($saasid){
	$urlParam = array($saasid);
	array_unshift($urlParam, 'getSuperUserName');
	$url = implode('/', $urlParam);
	return $this->get(self::ORDER_SERVICE_NAME, $url);
}
}