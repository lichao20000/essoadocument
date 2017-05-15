<?php
/**
 * 数据回收站
 * @author wangtao
 *@DATA 20120822
 */
class ESRecycleBinAction extends ESActionBase
{
	public function index()
	{
		$proxy=$this->exec('getProxy','escloud_fileoperationws');
		$serviceIp=$proxy->getServiceIP();
		$status=1;
		$userID=$this->getuser()->getId();
		return $this->renderTemplate(array('userid'=>$userID,'serviceIp'=>$serviceIp));
	}
	public function datalist()
	{
		$request=$this->getRequest();
		$data=$request->getPost();
		$fields='';
		//$newPath=preg_replace('/100/','4',$data['path'],1);
		$fields=$this->getFields($data['path'],'string');
		return $this->renderTemplate(array('type'=>$data,'fields'=>$fields));
		
	}
	public function getDataList()
	{
		$request=$this->getRequest();
		$page=$request->getPost('page');
		$page = isset($page) ? $page : 1;
		$path = $request->getGet('path');
		$keyWord = isset($_GET['keyWord']) ? $_GET['keyWord'] : "";
		$rp=$request->getPost('rp');
		$query= isset($_POST['query']) ? $_POST['query'] : 0;
		$condition=array();
		if(isset($query['condition'])){
			$condition=$query['condition'];//筛选条件
		}
		$rp = isset($rp) ? $rp : 20;
		$newPath=preg_replace('/4/','100',$path,1);
		$json=$this->getFields($path,'array');
		$arr=array('keyword'=>$keyWord,'condition'=>$condition,'columns'=>$json,'parentPath'=>'');
		$list=json_encode($arr);
		$start=($page-1)*$rp;
		$userId=$this->getUser()->getId();
		$userId=!empty($userId)?$userId:0;
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getDataList($newPath,$start,$rp,$userId,$list);
		$rows=json_decode(json_encode($data),true);
		//$rows=$this->getDataList($path,$start,$rp,0,$list);
		$total = isset($rows['total'])?$rows['total']:0;
		//header("Content-type: application/json");
		$jsonData = array('page'=>$page,'total'=>$total,'rows'=>array());
		if(!$total){
			echo json_encode($jsonData);
			return;
		}
		foreach($rows['dataList'] AS $row){
			$entry= array('id'=>$start,
					'cell'=>array(
							'num'=>$start+1,
							'ids'=>'<input type="checkbox" name="path" class="selectone" value='.$row["path"].'>',
							'operate'=>'<span class="editbtn" onclick=show_items("'.$row["path"].'","'.$row["bussystemid"].'",this)>&nbsp;</span></a>',
					),
			);
			/** wanghongchen 20140716 添加电子文件标识 **/
			if($row['filecount']){
				$entry['cell']['operate'].='&nbsp;&nbsp;<span title="查看电子文件" class="link" onclick=show_file("'.$row["path"].'") >&nbsp;</span>';
			}
			for($j=0;$j<count($json);$j++)
			{
				if(array_key_exists($json[$j],$row))
				{
					$entry['cell'][$json[$j]]=$row[$json[$j]];
				}
				
			}
			$jsonData['rows'][] = $entry;
			$start++;
				
		}
		echo json_encode($jsonData);
	}
	/**
	 * @author
	 * 数据恢复
	 */
	public function revertData()
	{
		$request=$this->getRequest();
		$data=$request->getPost('path');
		if(!empty($data))
		{
			$path=rtrim($data,',');
			$pathJson=json_encode(explode(',', $path));
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$userId=$this->getUser()->getId();
			$result=$proxy->setBackForRecycle($userId,$pathJson);
			echo $result;
		}
	}
	/**
	 * @author
	 * 永久删除
	 */
	public function perDelData()
	{
		$request=$this->getRequest();
		$data=$request->getPost('path');
		if(!empty($data))
		{
			$path=rtrim($data,',');
			$pathJson=json_encode(explode(',', $path));
			$proxy=$this->exec('getProxy','escloud_businesseditws');
			$result=$proxy->delItems($pathJson);
			echo $result;
		}
	}
	/**
	 * @author
	 * 清空
	 */
	public function perEmptyData()
	{
		$request=$this->getRequest();
		$path=$request->getPost('path');
		$newPath=preg_replace('/4/','100',$path,1);
		$userId=$this->getUser()->getId();
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$result=$proxy->removeRecycleBinData($newPath,$userId);
		echo $result;
	}
	/**
	 * @author wangtao
	 * 获取字段值
	 */
	private function getFields($param,$type)
	{
		$proxy=$this->exec('getProxy','escloud_businesseditws');
		$data=$proxy->getFields($param);
		if($type!=''&& $type=='string')
		{
			$str='';
			foreach ($data as $key=>$value)
			{
				$str.=json_encode($value).',';
			}
			$str=rtrim($str,',');
			return $str;
		}else{
			$data=json_decode(json_encode($data),true);
			$arr=array();
			foreach ($data as $value)
			{
				$arr[]=$value['name'];
			}
			return $arr;
		}
	}

}