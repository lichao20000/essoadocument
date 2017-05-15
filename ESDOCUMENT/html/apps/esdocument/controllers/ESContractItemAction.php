<?php
/**
 * 合同工程模块
 * @author dengguoqi
 *
 */
class ESContractItemAction extends ESActionBase {
	// 首页渲染图片
	public function index() {
		return $this->renderTemplate ( array (
				'status' => 1
		) );
	}
	/**
	 * 分页获取合同列表
	 * @author gaoyide
	 */
	public function findContractList() {
		$page = isset($_POST['page'])?$_POST['page']:1;
		$pre = isset($_POST['rp'])?$_POST['rp']:20;
		$query = isset ( $_POST ['query'] ) ? $_POST ['query'] : '';
		$where = null;
		if ($query !== '') {
			if (isset ( $query ['condition'] )) {
				$where = $query ['condition'];
			}
		}
		$data = array ('where' => $where);
		$contracritem = $this->exec ( "getProxy", "contractitem" );
		$list = $contracritem->findContractList($page,$pre,json_encode ( $data ));
		$count = $contracritem->getCount(json_encode ( $data ));
		$result = array (
				"page" => $page,
				"total" => $count,
				"rows" => array ()
		);
		$start = ($page-1)*$pre;
		if (isset ( $list ) && count ( $list ) > 0) {
			foreach ( $list as $contrat ) {
				$contrat->startNum = $start+1;
				$contrat->ids = "<input type='checkbox' name=\"changeId\" value=" . $contrat->id . " id=\"changeId\">";
				$contrat->operate = "<span class='editbtn' id=" . $contrat->id . "> </span>";
				$result["rows"][]=array(
						"id" => $contrat->id,
						"cell" => $contrat
				);
				$start++;
			}
		}
		echo json_encode ( $result );
	}
	
	/**
	 * 新增合同工程
	 *
	 * @author gaoyide 20141110
	 */
	public function addContract() {
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		$newcont = isset ( $_POST [ 'contract' ] ) ? $_POST [ 'contract' ] : null;
		$contractname = isset ( $newcont [ 'escontractname' ] ) ? $newcont [ 'escontractname' ] : null;
		$contractnum = isset ( $newcont [ 'escontractnum' ] ) ? $newcont [ 'escontractnum' ] : null;
		$projectname = isset ( $newcont [ 'esprojectname' ] ) ? $newcont [ 'esprojectname' ] : null;
		$device = isset ( $newcont [ 'esdevice' ] ) ? $newcont [ 'esdevice' ] : null;
		$company = isset ( $newcont [ 'escompany' ] ) ? $newcont [ 'escompany' ] : null;
		$person = isset ( $newcont [ 'esperson' ] ) ? $newcont [ 'esperson' ] : null;
		$persontel = isset ( $newcont [ 'esperstel' ] ) ? $newcont [ 'esperstel' ] : null;
		$json = array(
				'ip'=>$ip,
				'userId'=>$userId,
				'contractname'=>$contractname,
				'contractnum'=>$contractnum,
				'projectname'=>$projectname,
				'device'=>$device,
				'company'=>$company,
				'person'=>$person,
				'persontel'=>$persontel,
		);
		$list=json_encode($json);
		$contracritem = $this->exec ( "getProxy", "contractitem" );
		$data = $contracritem->addContract ($list);
		echo json_encode($data);
	}
	/**
	 * 删除合同工程
	 * @author gaoyide 20141110
	 */
	public function delContract(){
		$cont = isset($_POST['ids'])?$_POST['ids']:null;
		$ids = isset ( $cont ['ids'] ) ? $cont ['ids'] : '';

		$lists = explode(",", $ids);
		$contracritem = $this->exec ( "getProxy", "contractitem" );
		$data = $contracritem->delContract(json_encode($lists));
		echo json_encode($data);
	}
	/**
	 * 编辑合同工程
	 */
	public function edit() {
		if (isset ( $_POST ['id'] )) {
			$proxy = $this->exec ( "getProxy", "contractitem" );
			$id = $_POST ['id'];
			$contract = ( array ) $proxy->getContract ( $id );
			//echo json_encode($contract);
			return $this->renderTemplate ( $contract );
		}
	}
	/**
	 * 更新合同
	 */
	public function updateContract(){
		$param = $_POST;
		$userId = $this->getUser()->getId();
		$ip= $this->getClientIp();
		if(isset($param['id'])){
			$escontractname = isset($param['escontractname'])?$param['escontractname']:'';
			$escontractnum = isset($param['escontractnum'])?$param['escontractnum']:'';
			$esprojectname = isset($param['esprojectname'])?$param['esprojectname']:'';
			$esdevice = isset($param['esdevice'])?$param['esdevice']:'';
			$escompany = isset($param['escompany'])?$param['escompany']:'';
			$esperson = isset($param['esperson'])?$param['esperson']:'';
			$esperstel = isset($param['esperstel'])?$param['esperstel']:'';
		}
		$contract = json_encode ( array (
				'ip'=>$ip,
				'userId'=>$userId,
				'id'=>$param['id'],
				'escontractname'=>$escontractname,
				'escontractnum'=>$escontractnum,
				'esprojectname'=>$esprojectname,
				'esdevice'=>$esdevice,
				'escompany'=>$escompany,
				'esperson'=>$esperson,
				'esperstel'=>$esperstel
		));
		$proxy = $this->exec ( "getProxy", "contractitem" );
		$flag = $proxy->updateContract($contract);
		echo $flag;
	}
	
	/**
	 * 验证合同号唯一性
	 */
	public function uniqueContractNum() {
		$contractNum = isset ( $_POST ['contractNum'] ) ? $_POST ['contractNum'] : '';
		if ($contractNum != '') {
			$proxy= $this->exec ( "getProxy", 'contractitem' );
			echo $proxy->uniqueContractNum ( $contractNum );
		}
	}
}
