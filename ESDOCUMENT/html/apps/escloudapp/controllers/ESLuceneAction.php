<?php
/**
 * 20140504
 * @author liqiubo
 * 索引库管理
 *
 */
class ESLuceneAction extends ESActionBase{
	/**
	 * 获取已经索引库的节点列表
	 * liqiubo 20140504
	 */
	public function getCreatedNodesList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start = ($page - 1) * $limit;
		$nodePath = $_POST['query']['condition'];//在table中，codition中就传的nodePath
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$param = json_encode(array("nodePath" => $nodePath, "start" => $start, "limit" => $limit));
		$lists = $proxy->getCreatedNodesList($param);
		$total = $lists->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$line = ($page - 1) * $limit + 1; // 1-20, 21-40,41-60
		foreach ($lists->list as $list){
			$entry = array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" name="checkCreatedOne" value='.$list->treeNodeId.'@'.$list->struId.'@'.$list->id.'>',
							'line'=> $line++,
							'nodeName'=> $list->fullName,
							'indexPath'=> $list->indexPath
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 获取还没有创建索引库的节点列表
	 * liqiubo 20140504
	 */
	public function getNoCreateNodesList(){
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rp']) ? $_POST['rp'] : 20;
		$start = ($page - 1) * $limit;
		$nodePath = $_POST['query']['condition'];
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$param = json_encode(array("nodePath" => $nodePath, "start" => $start, "limit" => $limit));
		$lists = $proxy->getNoCreateNodesList($param);
		$total = $lists->total;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		$line = ($page - 1) * $limit + 1; // 1-20, 21-40,41-60
		foreach ($lists->list as $list){
			$entry = array(
					'id'=>$list->id,
					'cell'=>array(
							'id'=>'<input type="checkbox" name="checkAllNoCreateOne" value='.$list->id.'@'.$list->id_structure.'>',
							'line'=> $line++,
							'nodeName'=> $list->estitle,
							'nodePath'=> $list->id
					),
			);
			$jsonData['rows'][] = $entry;
		}
		echo json_encode($jsonData);
	}
	
	/**
	 * 删除索引库
	 * liqiubo 20140504
	 */
	public function delete(){
		$ids = $_POST['ids'];
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array("ids" => $ids,'userId'=>$userId,'userIp'=>$userIp));
		$resultMap = $proxy->deleteIndexStore($param);
		$successful = $resultMap -> successful;
		echo $successful;
	}
	
	/**
	 * 清空索引库
	 * liqiubo 20140504
	 */
	public function deleteAll(){
		$ids = isset($_POST['ids'])?$_POST['ids']:'0';
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array("ids" => $ids,'userId'=>$userId,'userIp'=>$userIp));
		$resultMap = $proxy->deleteAllIndexStore($param);
		$successful = $resultMap -> successful;
		echo $successful;
		
	}
	
	/**
	 * 优化索引库
	 * liqiubo 20140504
	 */
	public function optimize(){
		$ids = $_POST['ids'];
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array("ids" => $ids,'userId'=>$userId,'userIp'=>$userIp));
		$resultMap = $proxy->optimizeIndexStore($param);
		$successful = $resultMap -> successful;
		echo $successful;
	}
	
	/**
	 * 重建索引库
	 * liqiubo 20140504
	 */
	public function reCreate(){
		$ids = $_POST['ids'];
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array("ids" => $ids,'userId'=>$userId,'userIp'=>$userIp));
		$resultMap = $proxy->reCreateIndexStore($param);
		$successful = $resultMap -> successful;
		echo $successful;
	}
	
	/**
	 * 创建索引库
	 * liqiubo 20140504
	 */
	public function create(){
		$ids = $_POST['ids'];
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array("ids" => $ids,'userId'=>$userId,'userIp'=>$userIp));
		$resultMap = $proxy->createIndexStore($param);
		$successful = $resultMap -> successful;
		echo $successful;
	}
	
	/**
	 * 创建所有库
	 * liqiubo 20140504
	 */
	public function createAll(){
		/** xiaoxiong 20141121 添加是否为空判断 **/
		$ids = isset($_POST['ids'])?$_POST['ids']:'0';
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$userId = $this->getUser()->getId();
		$userIp = $this->getClientIp();
		$param = json_encode(array("ids" => $ids,'userId'=>$userId,'userIp'=>$userIp));
		$resultMap = $proxy->createAllIndexStore($param);
		$successful = $resultMap -> successful;
		echo $successful;
	}
	
	/**
	 * 获取根据id，获取其他的同结构下的树节点
	 * liqiubo 20140709
	 */
	public function getOtherNodes(){
		$ids = $_POST['ids'];
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$param = json_encode(array("ids" => $ids));
		$resultMap = $proxy->getOtherNodes($param);
		$noHave = $resultMap->nohave;
		if($noHave=='1'){
			echo 1;
			return ;
		}else{
			$total = $resultMap->total;
			return $this->renderTemplate(array('total'=>$total,'lists'=>$resultMap->list),'ESLucene/otherNodes');
		}
	}
	/**
	 * 根据id 获取其他同结构下的id（已经建立了索引库的节点）
	 * liqiubo 20140710
	 */
	public function getOtherNodesForCreated(){
		$ids = $_POST['ids'];
		$proxy = $this->exec("getProxy", "escloud_luceneservice");
		$param = json_encode(array("ids" => $ids));
		$resultMap = $proxy->getOtherNodesForCreated($param);
		$noHave = $resultMap->nohave;
		if($noHave=='1'){
			echo 1;
			return ;
		}else{
			$total = $resultMap->total;
			$jsonContent = '';
			$ids = '';
			$id = '';
			foreach ($resultMap->list as $list){
				$jsonContent = $jsonContent.'<span>'.$list->estitle.'</span><br/>';
				$id =$list->TREENODEID.'@'.$list->ID_STRUCTURE.'@'.$list->ID;
				$ids = $ids.$id.',';
			}
			$jsonData['jsonContent']=$jsonContent;
			$jsonData['ids']=$ids;
			echo json_encode($jsonData);
		}
	}
}