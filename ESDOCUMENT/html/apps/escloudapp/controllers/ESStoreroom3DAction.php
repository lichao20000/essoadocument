<?php
/**
 *
 * @author liuhezeng
 * @Date 20140714
 * 3D库房Action
 */
class ESStoreroom3DAction extends ESActionBase
{
	public function index(){
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$storeList=$proxy->getRepositoryListImg();
		$temp=json_decode(json_encode($storeList),true);
		return $this->renderTemplate(array('storeList'=>$temp));
	}
	
	/**
	 * 通过排架号的ID返回层跟列。用来拼装前端的货架
	 * @author liuhezeng 20140716
	 * @param parentId 排架号的ID，
	 * @return 库房层跟列表
	 */
	public function getRepositoryListForColAndLayer(){
		$parentId = isset($_GET['parentId']) ? $_GET['parentId'] : '';
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$storeList=$proxy->getRepositoryListForColAndLayer($parentId);
		$temp=json_encode($storeList);
		echo $temp;
	}
	
	/**
	 * 通过BOXPATH获取到当前的里面的条目数据，并显示到grid表中
	 * @author liuhezeng 20140716
	 * @param boxPath 盒的Path格式如esp_$N_box_$boxId,其中$N跟$boxId为动态参数。
	 * @return 当前盒里面所有的条目数据
	 */
	public function getBoxContentsByBoxPath(){
		$boxPath = isset($_GET['boxPath']) ? $_GET['boxPath'] : '';
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$storeList=$proxy->getBoxContentsByBoxPath($boxPath);
		$temp=json_encode($storeList);
		echo $temp;
	}
	
	public function showArchiveList(){
		$boxPath = isset($_GET['boxPath']) ? $_GET['boxPath'] : '';
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$data=$proxy->getFields($boxPath);
		return $this->renderTemplate(array("datas"=>array($boxPath,json_encode($data))));
	}
	
	public function set_json(){
		$boxPath = isset($_GET['boxPath']) ? $_GET['boxPath'] : '';
		$proxy=$this->exec('getProxy','escloud_repositoryws');
		$data=$proxy->getFields($boxPath);
		$userId = $this->getUser()->getId();
		$json=array();
		foreach ($data as $value)
		{
			$json[]=$value->name;
		}
		$page = isset ( $_POST ['page'] ) ? $_POST ['page'] : 1;
		$rp = isset($rp) ? $rp : 20;
		$start=($page-1)*$rp;
		$arr=array('columns'=>$json);
		$list=json_encode($arr);
		$returnData=$proxy->getDataList($boxPath,$start,$rp,$userId,$list);
		$total = $returnData->total;
		$rows = $returnData->dataList;
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		foreach($rows AS $row){
			$entry= array(
					'cell'=>array(
							'num'=>$start+1,
							'ids'=> '<input boxid="'. $row->boxid.'" type="checkbox" name="path" class="selectone" value="'.$row->path.'">',
							'operate'=> '',
							'relation'=>$row->relation=='true'?1:'',
					),
						
			);
			$entry['cell']['operate'].='&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row->path.'") >&nbsp;</span>';
			for($j=0;$j<count($data);$j++)
			{
				if(array_key_exists($data[$j]->name,$row))
				{
					$colTmp = $data[$j]->name;
					$entry['cell'][$data[$j]->name]=$row->$colTmp ;
				}
			}
			$jsonData['rows'][] = $entry;
			$start++;
		}
		echo json_encode($jsonData);
	}
}