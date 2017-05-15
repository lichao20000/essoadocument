<?php
/**
 * 分类库维护
 * @author zhangjirimutu
 *@DATA 20120822
 */
class ESClassificationAction extends ESActionBase
{
  public function index()
   {
		return $this->renderTemplate();
	}
	/**
	 * 树的ajax显示
	 * @author ldm
	 */
	public function tree(){
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$lists = $proxy->gettree(0);
		$zNodes = array();
		$zNodes[] = array('id'=>0,'pId'=>0,'name'=>'分类库管理','open'=>true);
		foreach ($lists as $k=>$val)
		{
			$isParent=$proxy->CheckisParent($val->id);
			$zNodes[] = array('id'=>$val->id,'pId'=>0,'name'=>$val->className, 'isParent'=>$isParent,'classCode'=>$val->classCode);
		}
		echo json_encode($zNodes);
		
	}
	/**
	 * 获取子节点
	 * @author ldm
	 */
	public function getnode(){
		$id = $_POST['id'];
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$lists = $proxy->gettree($id);
		$result = array();
		foreach ($lists as $k=>$val){
			if ($proxy->gettree($val->id)!=null){
				$result[$k]["name"] = $val->className;
				$result[$k]["pId"] = $val->idParent;
				$result[$k]["id"] = $val->id;
				$result[$k]["isParent"] = true;
				$result[$k]["classCode"]=$val->classCode;
			}else{
				$result[$k]["name"] = $val->className;
				$result[$k]["pId"] = $val->idParent;
				$result[$k]["id"] = $val->id;
				$result[$k]["classCode"]=$val->classCode;
			}
			
		}
		echo json_encode($result);
	}
	/**
	 * 20120828
	 * @author zhangjirimutu
	 * 添加
	 */
	public function add()
	{   $pid=isset($_GET['pid'])?$_GET['pid']:"";
		if ($pid=="0"){
			return $this->renderTemplate(array('type'=>'','disabled'=>''));
		}else {
			$proxy = $this->exec('getProxy','escloud_essclassws');
			$parent = $proxy->getone($pid);
			return $this->renderTemplate(array('type'=>$parent->archiveType,'disabled'=>'disabled="disabled"'));
		}
	}
	/**
	 * 添加树节点
	 * @author ldm
	 */
	public function addval(){
		$pid = $_POST['pid'];
		$param = $_POST['param'];
		parse_str($param,$output);
		$list = array(
				'className'=>$output['classify'],
				'classCode'=>$output['classnum'],
				'fillingRange'=>$output['range'],
				'archiveType'=>$output['type'],
				'custodyTerm'=>$output['timelimit']
				);
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$list = json_encode($list);
		$results = $proxy->add($pid,$list);
		echo $results;
		
	}
	/**
	 * 20120829
	 * @author zhangjirimutu
	 * 编辑
	 */
	public function edit()
	{
		$id=isset($_GET['id'])?$_GET['id']:"";
		if ($id==""){
			return ;
		}else {
			$proxy = $this->exec('getProxy','escloud_essclassws');
			$parent = $proxy->getone($id);
			return $this->renderTemplate(array('list'=>$parent));
		}
		
	}
	/**
	 * 树节点的编辑操作
	 * @author ldm
	 */
	public function edval(){
		$id=$_POST['id'];
		if ($id==""){
			return;
		}
		$param = $_POST['param'];
		$proxy = $this->exec('getProxy','escloud_essclassws');
		//$parent = $proxy->getone($id);
		parse_str($param,$output);
		$list = array('id'=>$id,
				'classCode'=>$output['classnum'],
				'fillingRange'=>$output['range'],
				'className'=>$output['classify'],
				'custodyTerm'=>$output['timelimit'],
				'archiveType'=>$output['type'],
				'idParent'=>$output['parent']
				);
		
		$list = json_encode($list);
		$result = $proxy->edits($list);
		echo $result;
	}
	/**
	 * 删除节点（父节点或者子节点）
	 * @author ldm
	 */
	public function del(){
		$id=isset($_POST['id'])?$_POST['id']:"";
		if ($id=="")return;
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$del = $proxy->del($id);
		echo json_encode($del);
	}
	/**
	 * 唯一性检测
	 * @author ldm
	 */
	public function check(){
		$pid = $_POST['pid'];
		$id = $_POST['id'];
		$classnum = $_POST['classnum'];
		$classify=$_POST['classify'];
		$proxy = $this->exec('getProxy','escloud_essclassws');
		$checkname = $proxy->checkEssClassName(json_encode(array('pid'=>$pid,'classify'=>$classify,'id'=>$id)));
		$checkcode = $proxy->checkEssClassCode(json_encode(array('classnum'=>$classnum,'id'=>$id)));
		$result = array('checkname'=>$checkname,'checkcode'=>$checkcode);
		echo json_encode($result);
		
	}
	public function getTimelimit(){
		$proxy = $this->exec('getProxy','escloud_metadataws');
		$estitle = $_POST['estitle'];
		$data=$proxy->getPropvalueByEstitle($estitle);
		echo json_encode($data);
	}
	public function getArchiveTypes(){
		$proxy=$this->exec('getProxy','escloud_structureModelws');
		$list=$proxy->getArchiveTypes();
		echo json_encode($list);
	}
}