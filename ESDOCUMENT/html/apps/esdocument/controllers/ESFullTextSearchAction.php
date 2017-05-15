<?php
/**
 * 全文检索模块
 * @author dengguoqi
 *
 */
class ESFullTextSearchAction extends ESActionBase
{
	//首页渲染图片
	public function index()
	{
		return $this->renderTemplate(array('status'=>1));
	}
	/**
	 * 检索方法  普通检索
	 * @author yzh
	 * @date   20131107
	 */
	public function admin()
	{
		$SESScommon=array();
		$proxy = $this->exec('getProxy', 'documentBorrowing');
		$userId = $this->getUser()->getId();
		$user=$proxy->getUserByuserId($userId);
		$SESScommon=$proxy->getESScommon($user->userid);
		return $this->renderTemplate(array('SESScommon'=>$SESScommon));
	}
	
	/**
	 * 检索方法
	 */
	public function retrieveQuery(){
		/** lujixiang 20150417 添加高级检索条件  ***/
		/**
		$param = isset($_POST['page'])?$_POST['page']:null;
		$page = $param['page'];
		$limit = $param['limit'];
		//rongying 20150309 组合当前登录用户信息
		$userId = $this->getUser()->getId();
		$param['userId'] = $userId;
		$param['ip'] = $this->getClientIp();
		$json = array(
				'searchWord'=>$param['data'],
				'userId'=>$param['userId'],
				'ip'=>$param['ip']
		);
		if(isset($param['issenior'])){
			unset($param['issenior']);
		}
		**/
		$page = $_POST['page'];
		$limit = $_POST['limit'];
		$param = $_POST['data'];
		
		//rongying 20150309 组合当前登录用户信息
		$userId = $this->getUser()->getId();
		$param['userId'] = $userId;
		$param['ip'] = $this->getClientIp();
		
		$proxy = $this->exec('getProxy', 'fulltextsearch');
		$list = $proxy->retrieveQuery($page, $limit, json_encode($param));
		$li = '';
		$keyWord = $param['searchWord'];
		
		if(isset($list->error)){
			echo 'error: '.$list->error;
		}else{
			$totalResult=$list->resultTotal;
			if($totalResult==0){
				echo 'null';
			}else{
				$pageTotal=ceil($totalResult/$limit);
				$currentPage=$list->currentPage;
				$elapsedTime=$list->elapsedTime;
				foreach($list->displayList as $k=>$resultList){
					$carTit= $resultList->sysItem->title!=''?$resultList->sysItem->title :$keyWord;
					$carTit_id= $resultList->sysItem->id!=''?$resultList->sysItem->id :"";
					$elecFileCount = $resultList->sysItem->attacheMent !='' ? $resultList->sysItem->attacheMent : 0 ;
					$stageId = $resultList->sysItem->stageId!=''?$resultList->sysItem->stageId :"";
					$tagItem=$resultList->tagItem;
					$sysItem=$resultList->sysItem;
					
					/** lujixiang 20150402 **/
					/// $stageCode = $resultList->sysItem->stageCode!=''?$resultList->sysItem->stageCode :"";
					
					$tagItem=(array)$tagItem;
					$tagItemHtml='';
					$a_Id='';
					$red='';
					foreach($tagItem as $v=>$item){
						$tagItemHtml.='<abbr class="itemKey">'.$v.':&nbsp;'.'</abbr>'.$item.'&nbsp;&nbsp;&nbsp;';
						$red = $v;
					}
					$li .='<li>';
					$li .='<h3><a onclick="getDetailData(\''.$stageId.'\',\''.$carTit_id.'\');return false;" href="#" class="focus" style="text-decoration:underline;"><font color="#3560A4">'.$carTit.'</font></a>';
					if(0 < $elecFileCount){
						$li .='<span class="fileView" title="原文浏览" style="margin-top: 5px;" onclick="viewFile(\''.$stageId.'\',\''.$carTit_id.'\');"></span>';
					}
					$li .= '</h3><div style="width:650px;">';
					$attacheMent = array();
					$attacheMentTitle = array();
					foreach($sysItem as $v=>$item){
						
						if (strstr($v, "attacheMent_title_")) {
							$attacheMentTitle[$v] = $item ;
						}elseif (strstr($v, "attacheMent_")){
							$attacheMent[$v] = $item ;
						}elseif($v!="title" && $v!="id" && $v!="stageId" && !strstr($v, "attacheMent")) {
							if($red==$v){
								$li .=$tagItemHtml;
							}else{
								$li .='<span>'.$v.'：<font color="#3560A4">'.$item.'</font></span>';
								if($v=='类型代码'){
									$a_Id=$item;
								}
							}
						}
					}
					$attachMentCount= $resultList->sysItem->attacheMentCount ? $resultList->sysItem->attacheMentCount : 0;
					
					if (0 < $attachMentCount ) {
						$li .='<span style="cursor: pointer;" onclick="javascript:show_fileDetail(this, '.$attachMentCount.')"><a style="color:red;font-size:13px;text-decoration:underline;" >正文内容</a></span>';
						
						for ($i =0 ; $i < $attachMentCount; $i++){
							$attacheMentTitleIndex = 'attacheMent_title_'.$i ;
							$attacheMentIndex = 'attacheMent_'.$i ;
							
							$li .= '<input id="attacheMent_title_'.$i.'" value="'.$attacheMentTitle[$attacheMentTitleIndex].'" type="hidden" />' ;
							$li .= '<input id="attacheMent_'.$i.'" value="'.$attacheMent[$attacheMentIndex].'" type="hidden" />' ;
						}
					}
					
					
					
					$li .='</div>';
					$li .= '<a href="javascript:void(0);" style="margin-top: -50px;" onclick="addToArchivesCar(this);" class="applyToArchivesCar" id="'.$a_Id.'|'.$carTit.'|'.$carTit_id.'"><span>申请</span></a></li>';// 给申请按钮加个样式，避免bug306提到的不在一条线上的问题
				}
				if(@$param['queryType'] == 3) {
					$htm = '<ul class="filelist">'. $li .'</ul>';
					$htm .='<div id="filepages" class="pages"><div class="go"><a onclick="getFileListPage(this,-1,'.ceil($totalResult/$limit).');return false;" href="#">上一页</a></div><div class="page"><ul>';
					for($i=1; $i<$pageTotal+1; $i++){
						if($i == 1){
							$htm .= '<li><a onclick="getFileListPage(this,'.$i.','.ceil($totalResult/$limit).');return false;" href="#" class="focus">'. $i .'</a></li>';
						}else{
							$htm .= '<li><a onclick="getFileListPage(this,'.$i.','.ceil($totalResult/$limit).');return false;" href="#">'. $i .'</a></li>';
						}
					}
					$htm .= '</ul><div class="clear"></div></div><div class="go"><a onclick="getFileListPage(this,-2,'.ceil($totalResult/$limit).');return false;" href="#">下一页</a></div><div class="msg">共'.ceil($totalResult/$limit).'页<span style="display:none;">'. $totalResult .'</span>　　去第&nbsp;</label><input class="page-num" id="searchChangePageObj" totalPage="'.ceil($totalResult/$limit).'" value="" name="page" type="text" style="text-align: center;color: #9D9D9D;width: 42px; border: 1px solid #DEDEDE;height: 17px; _height: 16px; position: relative;z-index: 1;"><span style="left: -42px;position: relative;_top:-1;"><a onclick="var page = $(this).closest(\'span\').prev(\'input\').val();jump(page,'.ceil($totalResult/$limit).',\'innerfile\',this);" style="background-color: #4A8BC2;color: white;float: none;width: 30px;height: 30px;display: inline;cursor:pointer;border:none;">&nbsp; 确定 &nbsp;</a>&nbsp;页</span></div>';		//liqiubo 20140916 加入border样式，修复bug 313
				} else {
					$htm = '<ul class="list" id="result">'. $li .'</ul>';
					$htm .='<div class="pages"><div class="go"><a href="javascript:_page.go(-1);" id="prevGo">上一页</a></div><div class="page" id="rePage"><ul>';
					for($i=1; $i<$pageTotal+1; $i++){
						if($i == $page){
							$htm .= '<li><a href="javascript:;" class="focus" id="page_'.$i.'">'. $i .'</a></li>';
						}else{
							if($i > 10) {
								$htm .= '<li style="display:none;"><a href="javascript:;" id="page_'.$i.'">'. $i .'</a></li>';
							} else {
								$htm .= '<li><a href="javascript:;" id="page_'.$i.'">'. $i .'</a></li>';
							}
						}
					}
					$htm .= '</ul><div class="clear"></div></div><div class="go"><a href="javascript:_page.go(1);" id="nextGo">下一页</a></div><div class="msg">共'.ceil($totalResult/$limit).'页<span id="total" style="display:none;">'. $totalResult .'</span>　　去第&nbsp;</label><input class="page-num" id="searchChangePageObj" totalPage="'.ceil($totalResult/$limit).'" value="" name="page" type="text" style="text-align: center;color: #9D9D9D;width: 42px; border: 1px solid #DEDEDE;height: 17px; _height: 16px; position: relative;z-index: 1;"><span style="left: -43px;position: relative; _top: -1px;"><a onclick="var page = $(this).closest(\'span\').prev(\'input\').val();jump(page,'.ceil($totalResult/$limit).',\'file\',this);" style="background-color: #4A8BC2;color: white;float: none;width: 30px;height: 30px;display: inline;cursor:pointer;border:none;">&nbsp; 确定 &nbsp;</a>&nbsp;页</span></div>';		//liqiubo 20140916 加入border样式，修复bug 313
				}
				if(@$param['queryType'] != 3) {
					$htm .= '<div class="s_param">';
					$htm .= '<div class="s_count">找到约 '.$totalResult.' 条结果 （用时<span>'.$elapsedTime.'</span>）</div>';
					$htm .= '</div>';
				}
				$htm .= '</div>';
				echo $htm;
			}
		}
	}
	
	/**
	 * 检索方法  高级检索
	 * @author yzh
	 * @date   20131107
	 */
	public function intricate()
	{
		$SESScommon=array();
		$proxy = $this->exec('getProxy', 'documentBorrowing');
		$userId = $this->getUser()->getId();
		$user=$proxy->getUserByuserId($userId);
		$SESScommon=$proxy->getESScommon($user->userid);
		/** lujixiang 20150416   获取已建立索引的档案著录范围  **/
		$fullproxy = $this->exec('getProxy', 'lucene');
		$stageTypes = $fullproxy->getIndexedStageType();
		
		return $this->renderTemplate(array('SESScommon'=>$SESScommon, 'stageTypes'=>$stageTypes));
	}
	
}
